"use client";

import { X, CheckCircle2, XCircle, Loader2, RotateCcw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatBytes } from "@/lib/utils";
import type { UploadTask } from "@/types";

interface UploadProgressProps {
  queue: UploadTask[];
  onClear: () => void;
  onRetry: (id: string) => void;
  onClose: () => void;
}

export function UploadProgress({ queue, onClear, onRetry, onClose }: UploadProgressProps) {
  if (queue.length === 0) return null;

  const done = queue.filter((t) => t.status === "done").length;
  const errors = queue.filter((t) => t.status === "error").length;
  const active = queue.filter(
    (t) => t.status === "uploading" || t.status === "queued"
  ).length;

  const allDone = active === 0;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-2xl overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
        <div className="text-sm font-medium text-white">
          {active > 0 ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 text-brand-400 animate-spin" />
              Uploading {active} file{active !== 1 ? "s" : ""}...
            </span>
          ) : (
            <span>
              {done} uploaded
              {errors > 0 && `, ${errors} failed`}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {allDone && (
            <button
              onClick={onClear}
              className="text-xs text-gray-500 hover:text-white transition-colors"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* File list */}
      <div className="max-h-64 overflow-y-auto divide-y divide-[#2a2a2a] scrollbar-hide">
        {queue.map((task) => (
          <div key={task.id} className="px-4 py-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {task.status === "done" && (
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                )}
                {task.status === "error" && (
                  <XCircle className="h-4 w-4 text-red-400" />
                )}
                {(task.status === "uploading" || task.status === "queued") && (
                  <Loader2 className="h-4 w-4 text-brand-400 animate-spin" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-white truncate font-medium">
                    {task.file.name}
                  </p>
                  <span className="text-xs text-gray-500 shrink-0">
                    {formatBytes(task.file.size)}
                  </span>
                </div>
                {task.status === "uploading" && (
                  <div className="mt-1.5">
                    <Progress value={task.progress} className="h-1" />
                    <span className="text-xs text-gray-500 mt-0.5">{task.progress}%</span>
                  </div>
                )}
                {task.status === "error" && (
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-red-400">{task.error}</p>
                    <button
                      onClick={() => onRetry(task.id)}
                      className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Retry
                    </button>
                  </div>
                )}
                {task.status === "queued" && (
                  <p className="text-xs text-gray-500 mt-1">Waiting...</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
