"use client";

import { useCallback, useState, useRef } from "react";
import { CloudUpload } from "lucide-react";

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  children: React.ReactNode;
}

export function DropZone({ onFiles, children }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounter = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      dragCounter.current = 0;

      const files = Array.from(e.dataTransfer.files).filter((f) => f.size > 0);
      if (files.length > 0) {
        onFiles(files);
      }
    },
    [onFiles]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const files = Array.from(e.clipboardData.files);
      if (files.length > 0) {
        onFiles(files);
      }
    },
    [onFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        onFiles(files);
        e.target.value = "";
      }
    },
    [onFiles]
  );

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div
      className="relative flex-1 h-full"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onPaste={handlePaste}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInput}
        aria-label="Upload files"
      />

      {isDragOver && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-brand-500/10 border-2 border-dashed border-brand-500 rounded-xl m-4 pointer-events-none">
          <div className="text-center">
            <CloudUpload className="h-16 w-16 text-brand-400 mx-auto mb-4" />
            <p className="text-xl font-semibold text-white">Drop to upload</p>
            <p className="text-gray-400 mt-1">Files will be stored on Telegram</p>
          </div>
        </div>
      )}

      <div onClick={openFilePicker} className="hidden" />
      {children}
    </div>
  );
}
