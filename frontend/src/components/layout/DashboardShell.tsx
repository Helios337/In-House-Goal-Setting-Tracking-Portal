"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { RoleGuard } from "@/components/layout/RoleGuard";

interface DashboardShellProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export function DashboardShell({ allowedRoles, children }: DashboardShellProps) {
  return (
    <RoleGuard allowedRoles={allowedRoles}>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <Header />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </RoleGuard>
  );
}
