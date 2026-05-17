"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Key, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");

  const redirectByRole = (selectedRole: string) => {
    localStorage.setItem("userRole", selectedRole);

    if (selectedRole === "manager") {
      router.push("/manager/dashboard");
    } else if (selectedRole === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/employee/goals");
    }
  };

  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    redirectByRole(role);
  };

  const handleEntraSSO = () => {
    redirectByRole(role);
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
            Align, track, and review organizational goals
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleStandardLogin}>
          <div className="space-y-4 rounded-md shadow-sm">

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

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Sign In As
              </label>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager (L1)</option>
                <option value="admin">Admin / HR</option>
              </select>
            </div>

          </div>

          <button
            type="submit"
            className="group relative flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition"
          >
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <LogIn className="h-4 w-4 text-indigo-300 group-hover:text-indigo-200" />
            </span>

            Sign In with Credentials
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700"></div>
          </div>

          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-800 px-2 text-slate-400">
              Or continue with
            </span>
          </div>
        </div>

        <button
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
