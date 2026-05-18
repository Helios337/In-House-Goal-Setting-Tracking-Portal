import useSWR from "swr";
import type { AxiosResponse } from "axios";
import { api } from "@/lib/api";

export interface NotificationItem {
  id: number;
  user_id: number;
  type: string;
  title: string;
  body?: string;
  resource_type?: string;
  resource_id?: number;
  read_at?: string | null;
  delivery_status: string;
  created_at: string;
}

interface NotificationListResponse {
  notifications: NotificationItem[];
  unread_count: number;
}

const fetcher = (url: string) =>
  api.get(url).then((res: AxiosResponse) => res.data);

export function useNotifications() {
  const { data, error, isLoading, mutate } = useSWR<NotificationListResponse>(
    "/notifications",
    fetcher,
    { refreshInterval: 60000 }
  );

  return {
    notifications: data?.notifications || [],
    unreadCount: data?.unread_count || 0,
    isLoading,
    isError: error,
    mutate,
  };
}

export async function markNotificationRead(notificationId: number) {
  await api.post(`/notifications/${notificationId}/read`);
}
