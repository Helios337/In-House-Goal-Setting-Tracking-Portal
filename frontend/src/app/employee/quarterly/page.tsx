"use client";

import React, { useEffect, useState } from "react";
import { fetchCurrentSheet, logAchievement } from "@/lib/goal-api";
import { Spinner } from "@/components/ui/Spinner";

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];

export default function QuarterlyProgressPage() {
  const [goals, setGoals] = useState<{ id: number; title: string }[]>([]);
  const [quarter, setQuarter] = useState("Q1");
  const [values, setValues] = useState<Record<number, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentSheet()
      .then((s) => setGoals(s.goals.map((g) => ({ id: g.id, title: g.title }))))
      .catch(() => setMessage("Load goals first from an approved or draft sheet."))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      for (const g of goals) {
        const raw = values[g.id];
        if (raw === undefined || raw === "") continue;
        await logAchievement({
          goal_id: g.id,
          quarter,
          progress_percentage: parseFloat(raw),
        });
      }
      setMessage("Quarterly progress saved.");
    } catch {
      setMessage("Failed to save progress.");
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Spinner size="lg" /></div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Quarterly progress</h1>
      {message && <p className="text-sm text-indigo-700 bg-indigo-50 p-3 rounded-lg">{message}</p>}
      <form onSubmit={submit} className="space-y-4 bg-white border rounded-xl p-6">
        <label className="text-sm font-medium">Quarter</label>
        <select value={quarter} onChange={(e) => setQuarter(e.target.value)} className="block w-full border rounded-lg p-2 mb-4">
          {QUARTERS.map((q) => <option key={q} value={q}>{q}</option>)}
        </select>
        {goals.map((g) => (
          <div key={g.id} className="flex gap-3 items-center">
            <span className="flex-1 text-sm font-medium">{g.title}</span>
            <input type="number" min={0} max={100} placeholder="%" className="w-24 border rounded-lg p-2 text-sm"
              value={values[g.id] ?? ""} onChange={(e) => setValues((v) => ({ ...v, [g.id]: e.target.value }))} />
          </div>
        ))}
        <button type="submit" className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-semibold">Save</button>
      </form>
    </div>
  );
}
