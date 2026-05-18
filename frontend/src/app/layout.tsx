import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/providers/SessionProvider";
import { RealtimeProvider } from "@/providers/RealtimeProvider";

export const metadata: Metadata = {
  title: "In-House Goal Setting & Tracking Portal",
  description: "AtomQuest Hackathon 1.0 Enterprise Solution",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50 text-slate-900">
      <body className="h-full antialiased">
        <SessionProvider>
          <RealtimeProvider>
            <div className="min-h-screen flex flex-col">{children}</div>
          </RealtimeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
