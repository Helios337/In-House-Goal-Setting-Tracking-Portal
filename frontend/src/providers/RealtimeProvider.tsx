"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { ToastContainer, ToastType } from "@/components/ui/Toast";
import { useRealtime } from "@/hooks/useRealtime";

interface ToastItem {
  id: string;
  message: string;
  type?: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = React.createContext<ToastContextValue>({
  showToast: () => {},
});

export function useToast() {
  return React.useContext(ToastContext);
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const showToast = React.useCallback((message: string, type: ToastType = "info") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useRealtime(status === "authenticated" && !!session?.user?.accessToken);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}
