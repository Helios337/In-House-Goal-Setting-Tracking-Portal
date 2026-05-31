"use client";

import { SWRConfig } from "swr";
import { apiErrorMessage } from "@/lib/api";

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: true,
        shouldRetryOnError: (err) => {
          const message = apiErrorMessage(err, "");
          return !message.includes("Session expired");
        },
        errorRetryCount: 2,
      }}
    >
      {children}
    </SWRConfig>
  );
}
