// api/generate.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const AI_MODEL = 'gemini-2.5-flash-image';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        if (req.method !== 'POST') {
            res.status(405).json({ error: 'Method not allowed' });
            return;
        }

        const body = req.body || {};
        // Expect JSON:
        // { imageData: "data:<mime>;base64,<base64>", wearableData?: "...", templateId: "...", templateOptions?: {...} }
        const { imageData, wearableData, templateId, templateOptions } = body;

        if (!imageData) {
            res.status(400).json({ error: 'Missing imageData (main image)' });
            return;
        }

        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            console.error('Missing GEMINI_API_KEY / GOOGLE_API_KEY in env');
            res.status(500).json({ error: 'Server misconfiguration: missing API key' });
            return;
        }

        const ai = new GoogleGenAI({ apiKey });

        // helper to convert data URL to inlineData object expected by the SDK
        const makeInline = (dataUrl: string | null | undefined) => {
            if (!dataUrl) return null;
            const m = /^data:(.+);base64,(.*)$/.exec(dataUrl);
            if (!m) return null;
            return { mimeType: m[1], data: m[2] };
        };

        const mainInline = makeInline(imageData);
        const wearableInline = makeInline(wearableData);

        // Build parts. Include the main image first.
        const parts: any[] = [];
        if (mainInline) {
            parts.push({
                type: 'IMAGE',
                inlineData: mainInline,
            });
        }
        // If wearable provided, include it as a second image part (server-side template can use it)
        if (wearableInline) {
            parts.push({
                type: 'IMAGE',
                inlineData: wearableInline,
            });
        }

        // Add text/instruction part derived from templateOptions.text or fallback
        const instructionText = (templateOptions && (templateOptions.text || templateOptions.prompt)) || `Remix the provided image using template ${templateId}`;
        parts.push({
            type: 'TEXT',
            text: instructionText,
        });

        // Generate
        const response = await ai.models.generateContent({
            model: AI_MODEL,
            contents: { parts },
            config: {
                imageConfig: {
                    // optionally allow client to pass aspect ratio via templateOptions.aspectRatio
                    aspectRatio: templateOptions?.aspectRatio ?? undefined,
                },
            },
        });

        const candidates = response.candidates ?? [];
        const urls: string[] = [];

        for (const c of candidates) {
            const part = c?.content?.parts?.find((p: any) => p.inlineData);
            if (part?.inlineData?.data) {
                urls.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
            }
        }

        if (urls.length === 0) {
            res.status(500).json({ error: 'No images generated (empty response or blocked)' });
            return;
        }

        res.status(200).json({ images: urls });
    } catch (err: any) {
        console.error('API /api/generate error:', err);
        res.status(500).json({ error: err?.message ?? 'Unknown error' });
    }
}
