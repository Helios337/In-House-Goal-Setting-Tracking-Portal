"use client";

import useSWR from "swr";
import { useSession } from "next-auth/react";
import { createValidatedFetcher } from "@/lib/swr-fetcher";
import { auditLogPageSchema } from "@/lib/api-schemas";

const fetchAuditLog = createValidatedFetcher(auditLogPageSchema, "audit log");

export function useAuditLog(page: number = 1, limit: number = 20, targetUserId?: string) {
  const { status } = useSession();
  let endpoint = `/audit/logs?page=${page}&limit=${limit}`;
  if (targetUserId) {
    endpoint += `&userId=${targetUserId}`;
  }
  const swrKey = status === "authenticated" ? endpoint : null;

  const { data, error, isLoading } = useSWR(swrKey, fetchAuditLog, {
    keepPreviousData: true,
  });

  return {
    logs: data?.logs ?? [],
    totalPages: data?.totalPages ?? 1,
    isLoading,
    isError: error,
  };
}

export type { AuditLogEntry } from "@/lib/api-schemas";
