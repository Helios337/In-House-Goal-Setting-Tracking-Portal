"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function UnauthorizedPage() {
  const { data: session } = useSession();
  const role = session?.user?.roles?.[0] || "Employee";
  const home =
    role === "Manager (L1)"
      ? "/manager/dashboard"
      : role === "Admin / HR"
        ? "/admin/dashboard"
        : "/employee/goals";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Access denied</h1>
        <p className="mt-2 text-sm text-slate-500">
          You do not have permission to view this page.
        </p>
        <Link
          href={home}
          className="mt-6 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Go to your dashboard
        </Link>
      </div>
    </div>
  );
}
