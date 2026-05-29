"use client";

import React, { useEffect, useState } from "react";
import { api, apiErrorMessage } from "@/lib/api";
import { Spinner } from "@/components/ui/Spinner";
import { useSession } from "next-auth/react";

interface Cycle {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
}

export default function CycleSettingsPage() {
  const { status } = useSession();
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    api
      .get<Cycle[]>("/cycles")
      .then((res) => setCycles(res.data))
      .catch((err) => setError(apiErrorMessage(err, "Failed to load cycles.")))
      .finally(() => setLoading(false));
  }, [status]);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Performance cycles</h1>
      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-3">
          {error}
        </p>
      )}
      {!error && (
        <div className="bg-white border rounded-xl divide-y">
          {cycles.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">
              No cycles configured. From the project root with Postgres running:{" "}
              <code className="text-xs bg-slate-100 px-1 rounded">
                cd backend && PYTHONPATH=. python scripts/seed.py
              </code>
            </p>
          ) : (
            cycles.map((c) => (
              <div key={c.id} className="p-4 flex justify-between text-sm">
                <span className="font-semibold text-slate-800">{c.name}</span>
                <span className="text-slate-500">
                  {new Date(c.start_date).toLocaleDateString()} –{" "}
                  {new Date(c.end_date).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
