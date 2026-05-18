"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Spinner } from "@/components/ui/Spinner";

interface Cycle {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
}

export default function CycleSettingsPage() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Cycle[]>("/cycles")
      .then((res) => setCycles(res.data))
      .catch(() => setError("Failed to load cycles."))
      .finally(() => setLoading(false));
  }, []);

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
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <div className="bg-white border rounded-xl divide-y">
        {cycles.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No cycles configured. Run database seed.</p>
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
    </div>
  );
}
