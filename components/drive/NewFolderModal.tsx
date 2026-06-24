"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFolders } from "@/hooks/useFolders";

interface NewFolderModalProps {
  open: boolean;
  onClose: () => void;
  parentId?: string;
}

const FOLDER_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
];

export function NewFolderModal({ open, onClose, parentId }: NewFolderModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [loading, setLoading] = useState(false);
  const { mutate } = useFolders();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), parentId, color }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create folder");

      toast.success(`Folder "${name}" created`);
      await mutate();
      setName("");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create folder");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>New folder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Folder name"
            className="bg-[#0f0f0f] border-[#3a3a3a] text-white mt-2"
            autoFocus
            maxLength={255}
          />

          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">Color</p>
            <div className="flex gap-2 flex-wrap">
              {FOLDER_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${
                    color === c ? "ring-2 ring-white ring-offset-2 ring-offset-[#1a1a1a] scale-110" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
