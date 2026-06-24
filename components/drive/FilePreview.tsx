"use client";

import { useEffect, useState } from "react";
import {
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  File,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";
import type { DriveFile } from "@/types";

interface FilePreviewProps {
  file: DriveFile | null;
  allFiles: DriveFile[];
  onClose: () => void;
  onNavigate: (file: DriveFile) => void;
}

export function FilePreview({ file, allFiles, onClose, onNavigate }: FilePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
  }, [file?.id]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  if (!file) return null;

  const currentIndex = allFiles.findIndex((f) => f.id === file.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allFiles.length - 1;

  const handlePrev = () => {
    if (hasPrev) onNavigate(allFiles[currentIndex - 1]);
  };

  const handleNext = () => {
    if (hasNext) onNavigate(allFiles[currentIndex + 1]);
  };

  const downloadUrl = `/api/files/${file.id}/download`;
  const isImage = file.mime_type.startsWith("image/");
  const isVideo = file.mime_type.startsWith("video/");
  const isAudio = file.mime_type.startsWith("audio/");
  const isPDF = file.mime_type === "application/pdf";

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = file.name;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="shrink-0 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <p className="text-white font-medium truncate">{file.name}</p>
            <p className="text-xs text-gray-500">{formatBytes(file.size_bytes)}</p>
          </div>
        </div>

        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors shrink-0"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden p-8">
        {/* Prev / Next */}
        {hasPrev && (
          <button
            onClick={handlePrev}
            className="absolute left-4 z-10 p-3 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        {hasNext && (
          <button
            onClick={handleNext}
            className="absolute right-4 z-10 p-3 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        {isImage && (
          <img
            key={file.id}
            src={downloadUrl}
            alt={file.name}
            className="max-w-full max-h-full object-contain rounded-lg"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        )}

        {isVideo && (
          <video
            key={file.id}
            src={downloadUrl}
            controls
            className="max-w-full max-h-full rounded-lg"
            onLoadedData={() => setIsLoading(false)}
          >
            Your browser does not support video playback.
          </video>
        )}

        {isAudio && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-32 h-32 bg-[#1a1a1a] rounded-2xl flex items-center justify-center border border-[#2a2a2a]">
              <Music className="h-16 w-16 text-pink-400" />
            </div>
            <p className="text-white text-xl font-medium">{file.name}</p>
            <audio
              key={file.id}
              src={downloadUrl}
              controls
              className="w-80"
              onLoadedData={() => setIsLoading(false)}
            />
          </div>
        )}

        {isPDF && (
          <iframe
            key={file.id}
            src={downloadUrl}
            title={file.name}
            className="w-full h-full rounded-lg bg-white"
            onLoad={() => setIsLoading(false)}
          />
        )}

        {!isImage && !isVideo && !isAudio && !isPDF && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="w-32 h-32 bg-[#1a1a1a] rounded-2xl flex items-center justify-center border border-[#2a2a2a]">
              <File className="h-16 w-16 text-gray-400" />
            </div>
            <div>
              <p className="text-white text-xl font-medium mb-2">{file.name}</p>
              <p className="text-gray-400 text-sm">{file.mime_type}</p>
              <p className="text-gray-500 text-sm">{formatBytes(file.size_bytes)}</p>
            </div>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors font-medium"
            >
              <Download className="h-5 w-5" />
              Download file
            </button>
          </div>
        )}

        {isLoading && (isImage || isVideo || isAudio) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Footer */}
      {allFiles.length > 1 && (
        <div className="flex items-center justify-center gap-2 py-3 border-t border-white/10">
          <span className="text-xs text-gray-500">
            {currentIndex + 1} of {allFiles.length}
          </span>
        </div>
      )}
    </div>
  );
}
