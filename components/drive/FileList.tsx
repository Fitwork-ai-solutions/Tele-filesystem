"use client";

import { FileRow } from "./FileRow";
import type { DriveFile } from "@/types";

interface FileListProps {
  files: DriveFile[];
  onPreview: (file: DriveFile) => void;
  onRename: (file: DriveFile) => void;
  onDelete: (file: DriveFile) => void;
  onStar: (file: DriveFile) => void;
  onDownload: (file: DriveFile) => void;
}

export function FileList({
  files,
  onPreview,
  onRename,
  onDelete,
  onStar,
  onDownload,
}: FileListProps) {
  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-[#2a2a2a] mb-1">
        <div className="w-8" />
        <div className="flex-1">Name</div>
        <div className="hidden sm:block w-24 text-right">Size</div>
        <div className="hidden md:block w-36 text-right">Modified</div>
        <div className="w-20" />
      </div>

      <div className="space-y-0.5 mt-1">
        {files.map((file) => (
          <FileRow
            key={file.id}
            file={file}
            onPreview={onPreview}
            onRename={onRename}
            onDelete={onDelete}
            onStar={onStar}
            onDownload={onDownload}
          />
        ))}
      </div>
    </div>
  );
}
