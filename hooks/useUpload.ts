"use client";

import { useState, useCallback, useRef } from "react";
import { mutate } from "swr";
import type { UploadTask } from "@/types";

export function useUpload(folderId?: string) {
  const [queue, setQueue] = useState<UploadTask[]>([]);
  const activeRef = useRef(false);

  const updateTask = useCallback(
    (id: string, patch: Partial<Omit<UploadTask, "id" | "file">>) => {
      setQueue((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
      );
    },
    []
  );

  const uploadOne = useCallback(
    (task: UploadTask): Promise<void> => {
      return new Promise((resolve) => {
        const formData = new FormData();
        formData.append("file", task.file);
        if (folderId) formData.append("folderId", folderId);

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            updateTask(task.id, { progress: pct, status: "uploading" });
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 201 || xhr.status === 200) {
            try {
              const res = JSON.parse(xhr.responseText);
              updateTask(task.id, {
                status: "done",
                progress: 100,
                result: res.data,
              });
              mutate(
                (key: string) =>
                  typeof key === "string" && key.startsWith("/api/files"),
                undefined,
                { revalidate: true }
              );
            } catch {
              updateTask(task.id, { status: "error", error: "Invalid response" });
            }
          } else {
            let errMsg = "Upload failed";
            try {
              const res = JSON.parse(xhr.responseText);
              errMsg = res.error || errMsg;
            } catch {}
            updateTask(task.id, { status: "error", error: errMsg });
          }
          resolve();
        });

        xhr.addEventListener("error", () => {
          updateTask(task.id, { status: "error", error: "Network error" });
          resolve();
        });

        xhr.addEventListener("timeout", () => {
          updateTask(task.id, { status: "error", error: "Upload timed out" });
          resolve();
        });

        xhr.timeout = 300000;
        xhr.open("POST", "/api/files");
        updateTask(task.id, { status: "uploading", progress: 0 });
        xhr.send(formData);
      });
    },
    [folderId, updateTask]
  );

  const processQueue = useCallback(async () => {
    if (activeRef.current) return;
    activeRef.current = true;

    while (true) {
      const next = await new Promise<UploadTask | null>((res) => {
        setQueue((prev) => {
          const queued = prev.find((t) => t.status === "queued");
          res(queued || null);
          return prev;
        });
      });

      if (!next) break;
      await uploadOne(next);
    }

    activeRef.current = false;
  }, [uploadOne]);

  const addFiles = useCallback(
    (files: File[]) => {
      const newTasks: UploadTask[] = files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        progress: 0,
        status: "queued" as const,
      }));

      setQueue((prev) => [...prev, ...newTasks]);
      processQueue();
    },
    [processQueue]
  );

  const clearCompleted = useCallback(() => {
    setQueue((prev) => prev.filter((t) => t.status !== "done" && t.status !== "error"));
  }, []);

  const retryTask = useCallback(
    (id: string) => {
      setQueue((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, status: "queued" as const, progress: 0, error: undefined } : t
        )
      );
      processQueue();
    },
    [processQueue]
  );

  const hasActive = queue.some(
    (t) => t.status === "queued" || t.status === "uploading"
  );

  return { queue, addFiles, clearCompleted, retryTask, hasActive };
}
