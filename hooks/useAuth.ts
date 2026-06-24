"use client";

import useSWR from "swr";
import type { User } from "@/types";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Unauthorized");
    return r.json();
  });

export function useAuth() {
  const { data, error, isLoading, mutate } = useSWR<{ data: User; error: null }>(
    "/api/user",
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    user: data?.data ?? null,
    isLoading,
    isError: !!error,
    mutate,
  };
}
