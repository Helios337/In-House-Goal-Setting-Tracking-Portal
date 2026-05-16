"use client";

import * as React from "react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";

export function Header() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Guest User";
  const userRole = session?.user?.roles?.[0] || "Employee";

  // Mock function for the hackathon demo to switch roles without re-logging in
  const handleRoleSwitch = (newRole: string) => {
    // In a real app, you wouldn't do this client-side.
    // For the hackathon demo, you might update a cookie or send an API request 
    // to mutate the NextAuth JWT token to evaluate different user journeys easily.
    console.log(`Demo: Requesting role switch to ${newRole}`);
    alert(`Hackathon Demo: Switch to ${newRole} triggered. (Implement via JWT mutation)`);
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle could go here */}
        <h2 className="text-lg font-semibold text-slate-800 hidden sm:block">
          Welcome back, {userName.split(" ")[0]}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Hackathon Role Switcher (Visible for eval purposes) */}
        <div className="hidden lg:flex items-center gap-2 border-r border-slate-200 pr-4">
          <span className="text-xs text-slate-500 font-medium">Demo Mode:</span>
          <select 
            className="text-sm border-slate-300 rounded-md shadow-sm py-1 pl-2 pr-6 focus:ring-blue-500 focus:border-blue-500"
            value={userRole}
            onChange={(e) => handleRoleSwitch(e.target.value)}
          >
            <option value="Employee">Employee</option>
            <option value="Manager (L1)">Manager</option>
            <option value="Admin / HR">Admin / HR</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-900">{userName}</p>
            <p className="text-xs text-slate-500">{userRole}</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
            {userName.charAt(0)}
          </div>
          <Button variant="ghost" size="sm" onClick={() => signOut()}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
