
import React, { useState, useCallback, DragEvent, useId, useEffect, useRef } from 'react';
import { UploadIcon } from './Icons';

interface UploadZoneProps {
  onFileChange: (file: File | null) => void;
  title: string;
  subtitle: 'Required' | 'Optional';
  file?: File | null;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ 
  onFileChange, 
  title, 
  subtitle, 
  file, 
  onMouseEnter, 
  onMouseLeave 
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync preview with external file prop (e.g. from paste or parent state reset)
  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }, [file]);

  const handleFile = useCallback((selectedFile: File | null) => {
    if (selectedFile && (selectedFile.type === "image/jpeg" || selectedFile.type === "image/png" || selectedFile.type === "image/webp")) {
        if (selectedFile.size > 10 * 1024 * 1024) {
            alert("File size exceeds 10MB. Please choose a smaller file.");
            return;
        }
        onFileChange(selectedFile);
    } else if (selectedFile) {
        alert("Invalid file type. Please upload a JPG, PNG, or WebP file.");
    }
  }, [onFileChange]);

  const handleDragEnter = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
        e.dataTransfer.clearData();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault(); // Prevent text insertion
      e.stopPropagation();
      
      let pastedFile: File | null = null;
      if (e.clipboardData.files.length > 0) {
          pastedFile = e.clipboardData.files[0];
      } else if (e.clipboardData.items) {
          for (let i = 0; i < e.clipboardData.items.length; i++) {
              if (e.clipboardData.items[i].type.indexOf('image') !== -1) {
                  const f = e.clipboardData.items[i].getAsFile();
                  if (f) {
                      pastedFile = f;
                      break;
                  }
              }
          }
      }
      
      if (pastedFile) {
          handleFile(pastedFile);
      }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      // Allow Ctrl/Cmd + V
      if (e.ctrlKey || e.metaKey) {
          return;
      }
      // Trigger click on Enter or Space
      if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          inputRef.current?.click();
          return;
      }
      // Block typing characters
      if (e.key.length === 1) {
          e.preventDefault();
      }
  };

  const handleClick = (e: React.MouseEvent) => {
      // Manually trigger input click since contentEditable might consume the event
      if (e.target !== inputRef.current) {
          inputRef.current?.click();
      }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <p className="block text-xl font-semibold text-gray-700 mb-2">{title} <span className={`text-base font-normal ${subtitle === 'Required' ? 'text-red-500' : 'text-gray-400'}`}>({subtitle})</span></p>
        
        <div
          role="button"
          tabIndex={0}
          contentEditable
          suppressContentEditableWarning
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          className={`relative block w-full aspect-square border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 outline-none caret-transparent ${isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-gray-50'} focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-400`}
        >
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleChange}
            className="hidden"
            aria-label={`${title} (${subtitle})`}
          />
          {preview ? (
            <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-2xl p-2 pointer-events-none" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 pointer-events-none select-none">
                <UploadIcon />
                <p className="mt-2 text-center text-lg">Drag, drop, <span className="font-semibold text-purple-500">paste</span> or <span className="font-semibold text-purple-500">click to browse</span></p>
                <p className="text-sm mt-1">JPG, PNG, WebP up to 10MB</p>
            </div>
          )}
        </div>
    </div>
  );
};
