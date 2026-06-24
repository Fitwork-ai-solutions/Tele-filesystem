"use client";

import { formatBytes } from "@/lib/utils";
import type { User } from "@/types";

interface StorageBarProps {
  user: User;
}

export function StorageBar({ user }: StorageBarProps) {
  const used = user.total_storage_bytes;
  const usedFormatted = formatBytes(used);

  return (
    <div className="px-3 py-3">
      <div className="bg-[#111] rounded-xl p-3 border border-[#2a2a2a]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400 font-medium">Storage</span>
          <span className="text-xs text-gray-500">{user.file_count} files</span>
        </div>
        <div className="w-full h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-brand-500 rounded-full transition-all"
            style={{ width: used > 0 ? "8%" : "0%" }}
          />
        </div>
        <div className="text-xs text-gray-500">
          <span className="text-white font-medium">{usedFormatted}</span> used · ∞ free
        </div>
      </div>
    </div>
  );
}
