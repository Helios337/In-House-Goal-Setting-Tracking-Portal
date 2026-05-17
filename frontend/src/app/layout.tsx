import type { Metadata } from "next";
import "./globals.css"; // Ensure Tailwind directives are here

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
        {/* Mock Global Auth Provider wrapper layout */}
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
