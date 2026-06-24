"use client";

import { useState, useCallback, useRef } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { DropZone } from "@/components/drive/DropZone";
import { UploadProgress } from "@/components/drive/UploadProgress";
import { OnboardingModal } from "@/components/drive/OnboardingModal";
import { useUpload } from "@/hooks/useUpload";
import type { ViewMode } from "@/types";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [showProgress, setShowProgress] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { queue, addFiles, clearCompleted, retryTask, hasActive } = useUpload();

  const handleFiles = useCallback(
    (files: File[]) => {
      addFiles(files);
      setShowProgress(true);
    },
    [addFiles]
  );

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="flex h-screen bg-[#0f0f0f] overflow-hidden">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0">
        <TopBar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onUpload={handleUploadClick}
          onSearch={setSearch}
        />

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (files.length) handleFiles(files);
            e.target.value = "";
          }}
          aria-label="Upload files"
        />

        <DropZone onFiles={handleFiles}>
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </DropZone>
      </div>

      {showProgress && queue.length > 0 && (
        <UploadProgress
          queue={queue}
          onClear={clearCompleted}
          onRetry={retryTask}
          onClose={() => {
            if (!hasActive) {
              setShowProgress(false);
              clearCompleted();
            }
          }}
        />
      )}

      <OnboardingModal />
    </div>
  );
}
