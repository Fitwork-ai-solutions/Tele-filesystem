"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { DriveFile } from "@/types";

interface DeleteConfirmProps {
  file: DriveFile | null;
  onClose: () => void;
  onDelete: () => void;
}

export function DeleteConfirm({ file, onClose, onDelete }: DeleteConfirmProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/files/${file.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }

      toast.success("File moved to trash");
      onDelete();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!file} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move to trash?</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-white">{file?.name}</span> will be moved to
            trash. You can restore it later or delete it permanently.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? "Moving..." : "Move to Trash"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
