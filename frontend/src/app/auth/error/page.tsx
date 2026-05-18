"use client";

import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md rounded-xl bg-slate-800 p-8 text-center ring-1 ring-slate-700">
        <h1 className="text-xl font-bold text-white">Authentication Error</h1>
        <p className="mt-2 text-sm text-slate-400">
          Sign-in failed. Check your credentials or Azure AD configuration.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
