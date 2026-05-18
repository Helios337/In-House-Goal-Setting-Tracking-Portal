"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { UI_ROLES, defaultPathForUiRole } from "@/lib/roles";

const roleOptions = [
  { value: UI_ROLES.employee, key: "employee" },
  { value: UI_ROLES.manager, key: "manager" },
  { value: UI_ROLES.admin, key: "admin" },
];

export function Header() {
  const { data: session } = useSession();
  const userName = session?.user?.name || session?.user?.email || "User";
  const userRole = session?.user?.roles?.[0] || UI_ROLES.employee;

  const handleRoleSwitch = async (newRole: string) => {
    const option = roleOptions.find((r) => r.value === newRole);
    if (!option || !session?.user?.email) return;

    await signIn("credentials", {
      email: session.user.email,
      password: "demo123",
      role: option.key,
      redirect: false,
    });
    window.location.href = defaultPathForUiRole(option.key);
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-20">
      <h2 className="text-lg font-semibold text-slate-800 hidden sm:block">
        Welcome back, {userName.split("@")[0].split(" ")[0]}
      </h2>

      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 border-r border-slate-200 pr-4">
          <span className="text-xs text-slate-500 font-medium">Role:</span>
          <select
            className="text-sm border-slate-300 rounded-md shadow-sm py-1 pl-2 pr-6 focus:ring-blue-500 focus:border-blue-500"
            value={userRole}
            onChange={(e) => handleRoleSwitch(e.target.value)}
          >
            {roleOptions.map((r) => (
              <option key={r.key} value={r.value}>
                {r.value}
              </option>
            ))}
          </select>
        </div>

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
