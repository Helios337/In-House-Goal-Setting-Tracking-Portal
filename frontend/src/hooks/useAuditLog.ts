import useSWR from "swr";
import type { AxiosResponse } from "axios";
import { api } from "@/lib/api";

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  details: string;
}

const fetcher = (url: string) => api.get(url).then((res: AxiosResponse) => res.data);

export function useAuditLog(page: number = 1, limit: number = 20, targetUserId?: string) {
  let endpoint = `/audit-logs?page=${page}&limit=${limit}`;
  if (targetUserId) {
    endpoint += `&userId=${targetUserId}`;
  }

  const { data, error, isLoading } = useSWR<{ logs: AuditLogEntry[], totalPages: number }>(
    endpoint, 
    fetcher,
    { keepPreviousData: true } // Keeps UI smooth during pagination
  );

  return {
    logs: data?.logs || [],
    totalPages: data?.totalPages || 1,
    isLoading,
    isError: error,
  };
}
