import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { Template, Stack, User } from '../types';
import { UploadZone } from './UploadZone';
import { Spinner } from './Spinner';
import { ArrowLeftIcon, DownloadIcon, RefreshIcon, SparklesIcon } from './Icons';
import { generateImage } from '../services/geminiService';

interface TemplateExecutionProps {
  template: Template;
  stack: Stack;
  onBack: () => void;
  onLoginRequired?: () => void;
  user?: User | null;
}

export const TemplateExecution: React.FC<TemplateExecutionProps> = ({
  template,
  stack,
  onBack,
  onLoginRequired,
  user
}) => {
  const [selfieImage, setSelfieImage] = useState<File | null>(null);
  const [wearableImage, setWearableImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
  const [partialResults, setPartialResults] = useState(false);
  const [hoveredZone, setHoveredZone] = useState<'selfie' | 'wearable' | null>(null);

  const isFititStack = stack.id === 'fitit';

  // Refs to access latest state inside stable event listener
  const selfieImageRef = useRef(selfieImage);
  const wearableImageRef = useRef(wearableImage);
  const hoveredZoneRef = useRef(hoveredZone);
  const isFititStackRef = useRef(isFititStack);
  const isLoadingRef = useRef(isLoading);
  const generatedImagesRef = useRef(generatedImages);

  // Sync refs with state
  useEffect(() => { selfieImageRef.current = selfieImage; }, [selfieImage]);
  useEffect(() => { wearableImageRef.current = wearableImage; }, [wearableImage]);
  useEffect(() => { hoveredZoneRef.current = hoveredZone; }, [hoveredZone]);
  useEffect(() => { isFititStackRef.current = isFititStack; }, [isFititStack]);
  useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);
  useEffect(() => { generatedImagesRef.current = generatedImages; }, [generatedImages]);

  // Paste handler
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
        // Check if user is authenticated
        if (!user) {
          onLoginRequired?.();
          return;
        }

        // Read latest state from refs
        if (isLoadingRef.current || generatedImagesRef.current) return;

        let file: File | null = null;
        
        // Priority 1: Check direct file list (common for file copying)
        if (e.clipboardData && e.clipboardData.files.length > 0) {
            for (let i = 0; i < e.clipboardData.files.length; i++) {
                const f = e.clipboardData.files[i];
                if (f.type.startsWith('image/')) {
                    file = f;
                    break;
                }
            }
        }
        
        // Priority 2: Check items (common for screenshots or direct image data copy)
        if (!file && e.clipboardData && e.clipboardData.items) {
             const items = e.clipboardData.items;
             for (let i = 0; i < items.length; i++) {
                 if (items[i].type.indexOf('image') !== -1) {
                     const f = items[i].getAsFile();
                     if (f) {
                         file = f;
                         break;
                     }
                 }
             }
        }

        if (file) {
            // Validate file
            if (file.size > 10 * 1024 * 1024) {
                alert("Pasted file size exceeds 10MB.");
                return;
            }
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                alert("Invalid file type. Please paste a JPG, PNG, or WebP image.");
                return;
            }

            const currentHoveredZone = hoveredZoneRef.current;
            const currentIsFititStack = isFititStackRef.current;
            const currentSelfie = selfieImageRef.current;
            const currentWearable = wearableImageRef.current;

            // Determine target zone
            if (currentHoveredZone === 'wearable' && currentIsFititStack) {
                setWearableImage(file);
            } else if (currentHoveredZone === 'selfie') {
                setSelfieImage(file);
            } else {
                // Intelligent fallback if not hovering over a specific zone
                if (!currentSelfie) {
                    setSelfieImage(file);
                } else if (currentIsFititStack && !currentWearable) {
                    setWearableImage(file);
                } else {
                    // Default to overwriting selfie if both full or logic fails
                    setSelfieImage(file);
                }
            }
        }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
        window.removeEventListener('paste', handlePaste);
    };
  }, [user, onLoginRequired]); // Add user and onLoginRequired to dependency array


  const handleRemix = useCallback(async () => {
    // Check if user is authenticated
    if (!user) {
      onLoginRequired?.();
      return;
    }

    const hasAllImages = isFititStack ? selfieImage && wearableImage : selfieImage;
    if (!hasAllImages) {
      setError("Please upload all required images.");
      return;
    }

    setError(null);
    setIsLoading(true);
    setGeneratedImages(null);
    setPartialResults(false);

    try {
      const result = await generateImage(template, selfieImage!, wearableImage);
      setGeneratedImages(result);
      if (isFititStack && result.length < 4) {
        setPartialResults(true);
      }
    } catch (e: any) {
      setError(e.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [selfieImage, wearableImage, template, isFititStack, user, onLoginRequired]);

  const handleRemixAgain = () => {
    setSelfieImage(null);
    setWearableImage(null);
    setGeneratedImages(null);
    setError(null);
    setPartialResults(false);
  };
  
  const handleDownload = (imageUrl: string, format: 'png' | 'jpeg', index: number) => {
    if(!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `remix-${template.id}-${index}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const remixButtonDisabled = isLoading || (isFititStack ? !selfieImage || !wearableImage : !selfieImage);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-12">
        <button onClick={onBack} aria-label={`Back to ${stack.name} templates`} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 text-lg">
            <ArrowLeftIcon />
            Back to {stack.name}
        </button>
        <div className="text-center mb-10">
            <h1 className="text-5xl font-bold text-gray-900 tracking-tight">{template.name}</h1>
            <p className="text-xl text-gray-500 mt-3">Upload your image(s) or paste from clipboard.</p>
        </div>

        {!generatedImages && !isLoading && (
            <>
                <div className={`flex flex-col md:flex-row justify-center items-start gap-8 mb-10`}>
                    <div className="w-full max-w-md mx-auto">
                        <UploadZone 
                            onFileChange={(file) => {
                              if (!user) {
                                onLoginRequired?.();
                                return;
                              }
                              setSelfieImage(file);
                            }}
                            title={isFititStack ? "1. Upload Your Selfie" : "Upload Your Image"} 
                            subtitle="Required"
                            file={selfieImage}
                            onMouseEnter={() => setHoveredZone('selfie')}
                            onMouseLeave={() => setHoveredZone(null)}
                        />
                    </div>
                    {isFititStack && (
                        <div className="w-full max-w-md mx-auto">
                            <UploadZone 
                                onFileChange={(file) => {
                                  if (!user) {
                                    onLoginRequired?.();
                                    return;
                                  }
                                  setWearableImage(file);
                                }}
                                title="2. Upload Wearable" 
                                subtitle="Required" 
                                file={wearableImage}
                                onMouseEnter={() => setHoveredZone('wearable')}
                                onMouseLeave={() => setHoveredZone(null)}
                            />
                        </div>
                    )}
                </div>
                <div className="text-center">
                    <button
                        onClick={handleRemix}
                        disabled={remixButtonDisabled}
                        className="inline-flex items-center justify-center gap-3 px-12 py-5 bg-purple-500 text-white font-semibold text-xl rounded-2xl shadow-lg shadow-purple-500/30 hover:bg-purple-600 transition-all duration-300 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2"
                    >
                        <SparklesIcon />
                        Remix Image
                    </button>
                </div>
            </>
        )}

        {isLoading && (
            <div className="flex flex-col items-center justify-center text-center p-16 bg-gray-50 rounded-2xl">
                <Spinner />
                <h2 className="text-2xl font-semibold text-gray-700 mt-6">Generating your images...</h2>
                <p className="text-gray-500 mt-2 text-lg">This usually takes about 20-30 seconds. Please wait.</p>
            </div>
        )}
        
        {error && !isLoading && (
             <div className="text-center p-8 bg-red-50 border border-red-200 rounded-2xl">
                 <p className="text-red-600 font-semibold text-lg">Error</p>
                 <p className="text-red-500 mt-2 text-lg">{error}</p>
                 <button onClick={handleRemix} className="mt-6 px-8 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 text-lg">Try Again</button>
             </div>
        )}

        {generatedImages && !isLoading && (
            <div className="text-center">
                 {partialResults && (
                    <div className="max-w-5xl mx-auto mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-left">
                        <p><strong className="font-semibold">Note:</strong> Some results may have been blocked due to our safety policy. For more complete results, please try using different photos that are suitable for all audiences.</p>
                    </div>
                )}
                <div className={`grid grid-cols-1 ${generatedImages.length > 1 ? 'md:grid-cols-2' : ''} gap-6 max-w-5xl mx-auto mb-8`}>
                    {generatedImages.map((imageSrc, index) => (
                        <div key={index} className="relative group border-2 border-gray-100 rounded-2xl shadow-lg overflow-hidden">
                            <img src={imageSrc} alt={`Generated result ${index + 1}`} className="w-full h-auto aspect-[3/4] object-cover" />
                            <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                               <button onClick={() => handleDownload(imageSrc, 'png', index)} aria-label={`Download image ${index + 1} as PNG`} className="p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white hover:text-purple-600 transition-colors shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500">
                                   <DownloadIcon/>
                               </button>
                               <button onClick={() => handleDownload(imageSrc, 'jpeg', index)} aria-label={`Download image ${index + 1} as JPG`} className="p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white hover:text-purple-600 transition-colors shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500">
                                   JPG
                               </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4">
                    <button onClick={handleRemixAgain} className="inline-flex items-center gap-2 px-8 py-4 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-gray-700/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-800 focus-visible:ring-offset-2 text-lg">
                      <RefreshIcon/>
                      Start Over
                    </button>
                    <button onClick={onBack} className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors border border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 text-lg">
                      Try Another Template
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};
