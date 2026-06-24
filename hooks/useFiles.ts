"use client";

import useSWR from "swr";
import type { DriveFile } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface UseFilesOptions {
  folderId?: string;
  search?: string;
  starred?: boolean;
  trashed?: boolean;
  sort?: string;
  direction?: string;
  page?: number;
  limit?: number;
}

export function useFiles(options: UseFilesOptions = {}) {
  const params = new URLSearchParams();
  if (options.folderId !== undefined) params.set("folderId", options.folderId);
  if (options.search) params.set("search", options.search);
  if (options.starred) params.set("starred", "true");
  if (options.trashed) params.set("trashed", "true");
  if (options.sort) params.set("sort", options.sort);
  if (options.direction) params.set("direction", options.direction);
  if (options.page) params.set("page", String(options.page));
  if (options.limit) params.set("limit", String(options.limit));

  const key = `/api/files?${params.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<{
    data: DriveFile[];
    total: number;
    page: number;
    limit: number;
    error: null;
  }>(key, fetcher);

  return {
    files: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading,
    isError: !!error,
    mutate,
    swrKey: key,
  };
}
