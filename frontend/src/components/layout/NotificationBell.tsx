"use client";

import * as React from "react";
import { Bell } from "lucide-react";
import {
  markNotificationRead,
  useNotifications,
} from "@/hooks/useNotifications";

export function NotificationBell() {
  const { notifications, unreadCount, mutate } = useNotifications();
  const [open, setOpen] = React.useState(false);

  const handleMarkRead = async (id: number) => {
    await markNotificationRead(id);
    mutate();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-md p-2 text-slate-600 hover:bg-slate-100"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 px-4 py-2 text-sm font-semibold text-slate-800">
            Notifications
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">
                No notifications yet
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`border-b border-slate-50 px-4 py-3 text-sm ${
                    !n.read_at ? "bg-blue-50/50" : ""
                  }`}
                >
                  <p className="font-medium text-slate-900">{n.title}</p>
                  {n.body && (
                    <p className="mt-1 text-slate-600 line-clamp-2">{n.body}</p>
                  )}
                  {!n.read_at && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(n.id)}
                      className="mt-2 text-xs text-blue-600 hover:underline"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
