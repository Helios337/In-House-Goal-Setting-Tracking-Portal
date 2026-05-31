"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { Shield, Key, LogIn } from "lucide-react";
import {
  DEMO_LOGIN_BY_ROLE,
  defaultPathForSessionRole,
  defaultPathForUiRole,
  type UiRoleKey,
} from "@/lib/roles";

const isDemoMode =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN === "true";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionExpired = searchParams.get("expired") === "1";

  const [role, setRole] = useState<UiRoleKey>("employee");
  const [email, setEmail] = useState(
    isDemoMode ? DEMO_LOGIN_BY_ROLE.employee.email : ""
  );
  const [password, setPassword] = useState(isDemoMode ? "demo123" : "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (nextRole: UiRoleKey) => {
    setRole(nextRole);
    if (isDemoMode) {
      setEmail(DEMO_LOGIN_BY_ROLE[nextRole].email);
    }
  };

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Login failed. Check email/password and ensure the API and database are ready.");
      return;
    }

    const session = await getSession();
    const roleLabel = session?.user?.roles?.[0] ?? "Employee";
    router.push(defaultPathForSessionRole(roleLabel));
  };

  const handleEntraSSO = () => {
    signIn("azure-ad", { callbackUrl: defaultPathForUiRole(role) });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-slate-800 p-8 shadow-xl ring-1 ring-slate-700/50">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Shield className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">
            AtomQuest Performance Portal
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign in with your corporate email and password, or use Microsoft Entra ID.
          </p>
        </div>

        {sessionExpired && (
          <p className="rounded-lg bg-amber-900/40 border border-amber-700 px-3 py-2 text-sm text-amber-200">
            Your session expired. Please sign in again.
          </p>
        )}

        {error && (
          <p className="rounded-lg bg-rose-900/40 border border-rose-700 px-3 py-2 text-sm text-rose-200">
            {error}
          </p>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleStandardLogin}>
          <div className="space-y-4 rounded-md shadow-sm">
            {isDemoMode && (
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Sign in as
                </label>
                <select
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value as UiRoleKey)}
                  className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {(Object.keys(DEMO_LOGIN_BY_ROLE) as UiRoleKey[]).map((key) => (
                    <option key={key} value={key}>
                      {DEMO_LOGIN_BY_ROLE[key].label}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-slate-500">
                  Demo mode: picks a seeded account for the selected role.
                </p>
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Corporate Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <div className="relative mt-1">
                <Key className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-slate-600 bg-slate-700 py-2 pl-10 pr-3 text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {isDemoMode && (
            <p className="text-xs text-slate-500 text-center">
              Demo password for seeded users: <span className="text-slate-400">demo123</span>
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition disabled:opacity-60"
          >
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <LogIn className="h-4 w-4 text-indigo-300 group-hover:text-indigo-200" />
            </span>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-800 px-2 text-slate-400">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleEntraSSO}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600 transition"
        >
          <Key className="h-4 w-4 text-cyan-400" />
          Sign In with Microsoft Entra ID
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-900 text-slate-400">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
