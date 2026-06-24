"use client";

import useSWR from "swr";
import type { Folder } from "@/types";

const fetcher = (url: string) =>
  fetch(url).then((r) => r.json());

export function useFolders() {
  const { data, error, isLoading, mutate } = useSWR<{
    data: Folder[];
    error: null;
  }>("/api/folders", fetcher, { revalidateOnFocus: false });

  return {
    folders: data?.data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}
