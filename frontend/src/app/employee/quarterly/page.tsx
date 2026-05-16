"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, ShieldCheck } from "lucide-react";

export default function AchievementCaptureForm() {
  const router = useRouter();
  const [achievements, setAchievements] = useState([
    { id: 1, title: "Scale Enterprise Retention ARR", target: "1200000", actual: "", status: "On Track" },
    { id: 2, title: "Optimize Ticket Resolution Engine", target: "24", actual: "", status: "Not Started" }
  ]);

  const handleActualChange = (idx: number, val: string) => {
    const next = [...achievements];
    next[idx].actual = val;
    setAchievements(next);
  };

  const handleStatusChange = (idx: number, val: string) => {
    const next = [...achievements];
    next[idx].status = val;
    setAchievements(next);
  };

  const handleSaveProgress = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Quarterly target tracking state logs compiled successfully.");
    router.push("/employee/goals");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Quarterly Matrix Check-In Update</h1>
        <p className="text-sm text-slate-500 mt-1">Provide performance metric details for current validation windows.</p>
      </div>

      <form onSubmit={handleSaveProgress} className="space-y-6">
        {achievements.map((item, idx) => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Objective Base Line #{idx + 1}</h3>
              <p className="text-base font-semibold text-slate-800 mt-0.5">{item.title}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-500">Structured Target Baseline</label>
                <input type="text" disabled value={item.target} className="mt-1 block w-full rounded-lg bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">Actual Metric Captured</label>
                <input
                  type="number"
                  required
                  value={item.actual}
                  onChange={(e) => handleActualChange(idx, e.target.value)}
                  placeholder="Enter dynamic value"
                  className="mt-1 block w-full rounded-lg border-slate-200 text-slate-800 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">Operational Target Status</label>
                <select
                  value={item.status}
                  onChange={(e) => handleStatusChange(idx, e.target.value)}
                  className="mt-1 block w-full rounded-lg border-slate-200 text-slate-800 bg-white focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option>Not Started</option>
                  <option>On Track</option>
                  <option>Completed</option>
                </select>
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
          >
            <ShieldCheck className="h-4 w-4" /> Sync Progress Data
          </button>
        </div>
      </form>
    </div>
  );
}
