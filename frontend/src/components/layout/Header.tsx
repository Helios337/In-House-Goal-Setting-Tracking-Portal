"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { UI_ROLES } from "@/lib/roles";

export function Header() {
  const { data: session } = useSession();
  const userName = session?.user?.name || session?.user?.email || "User";
  const userRole = session?.user?.roles?.[0] || UI_ROLES.employee;

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-20">
      <h2 className="text-lg font-semibold text-slate-800 hidden sm:block">
        Welcome back, {userName.split("@")[0].split(" ")[0]}
      </h2>

      <div className="flex items-center gap-4">
        <NotificationBell />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-900">{userName}</p>
            <p className="text-xs text-slate-500">{userRole}</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
            {userName.charAt(0).toUpperCase()}
          </div>
          <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
