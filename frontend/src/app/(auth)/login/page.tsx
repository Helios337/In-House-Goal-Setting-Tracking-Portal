"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { token, user, setAuth } = useAuthStore();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (token && user) {
      router.push(`/${user.role.toLowerCase()}/goals`);
    }
  }, [token, user, router]);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // FastAPI OAuth2PasswordRequestForm expects x-www-form-urlencoded data
      const formData = new URLSearchParams();
      formData.append("username", email); // Note: field must be 'username' for OAuth2
      formData.append("password", password);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Invalid email or password");
      }

      const data = await res.json();
      
      // In a full implementation, you would decode the JWT here to get the role,
      // or hit a '/api/users/me' endpoint with the new token.
      // Mocking the user object extraction for now:
      const decodedUser = { 
        id: 1, 
        email: email, 
        role: email.includes("manager") ? "MANAGER" : "EMPLOYEE" as const 
      };
      
      setAuth(data.access_token, decodedUser);
      router.push(`/${decodedUser.role.toLowerCase()}/goals`);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSSOLogin = () => {
    // Redirects to your backend SSO initiation endpoint
    window.location.href = "/api/auth/sso/login";
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl border border-slate-100">
        
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
             <span className="text-white font-bold text-xl">GP</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Sign in to Portal
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Manage your goals and team performance
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200">
            <p className="text-sm text-red-700 font-medium text-center">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleCredentialsLogin}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-slate-700 mb-1">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-70 transition-all"
            >
              {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Sign in with Email"}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm font-medium">
              <span className="bg-white px-4 text-slate-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleSSOLogin}
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-lg bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-all"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.4 24H0V12.6H11.4V24ZM24 24H12.6V12.6H24V24ZM11.4 11.4H0V0H11.4V11.4ZM24 11.4H12.6V0H24V11.4Z" fill="#00A4EF"/>
              </svg>
              <span className="text-sm font-semibold leading-6">Microsoft Entra ID</span>
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
