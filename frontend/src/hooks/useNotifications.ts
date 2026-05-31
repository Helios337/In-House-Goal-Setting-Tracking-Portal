"use client";

import useSWR from "swr";
import { useSession } from "next-auth/react";
import { createValidatedFetcher } from "@/lib/swr-fetcher";
import { notificationListSchema } from "@/lib/api-schemas";
import { api } from "@/lib/api";

const fetchNotifications = createValidatedFetcher(
  notificationListSchema,
  "notifications"
);

export function useNotifications() {
  const { status } = useSession();
  const swrKey = status === "authenticated" ? "/notifications" : null;
  const { data, error, isLoading, mutate } = useSWR(swrKey, fetchNotifications, {
    refreshInterval: 60000,
  });

  return {
    notifications: data?.notifications ?? [],
    unreadCount: data?.unread_count ?? 0,
    isLoading,
    isError: error,
    mutate,
  };
}

export async function markNotificationRead(notificationId: number) {
  await api.post(`/notifications/${notificationId}/read`);
}

export type { NotificationItem } from "@/lib/api-schemas";
