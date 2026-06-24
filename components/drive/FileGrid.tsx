"use client";

import { FileCard } from "./FileCard";
import type { DriveFile } from "@/types";

interface FileGridProps {
  files: DriveFile[];
  onPreview: (file: DriveFile) => void;
  onRename: (file: DriveFile) => void;
  onDelete: (file: DriveFile) => void;
  onStar: (file: DriveFile) => void;
  onDownload: (file: DriveFile) => void;
}

export function FileGrid({
  files,
  onPreview,
  onRename,
  onDelete,
  onStar,
  onDownload,
}: FileGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-6">
      {files.map((file) => (
        <FileCard
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
  );
}
