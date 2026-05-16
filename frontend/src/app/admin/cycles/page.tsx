"use client";

import React, { useState } from "react";
import { Calendar, ToggleLeft, ToggleRight, Clock, Plus } from "lucide-react";

export default function CycleTemporalConfiguration() {
  const [windows, setWindows] = useState([
    { period: "Phase 1 — Goal Setting", windowOpens: "1st May", activity: "Goal Creation, Submission & Approval", active: true }, [cite: 37]
    { period: "Q1 Check-in", windowOpens: "July", activity: "Progress Update — Planned vs. Actual", active: false }, [cite: 37]
    { period: "Q2 Check-in", windowOpens: "October", activity: "Progress Update — Planned vs. Actual", active: false } [cite: 37]
  ]);

  const toggleTargetWindowStatus = (index: number) => {
    const next = [...windows];
    next[index].active = !next[index].active;
    setWindows(next);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto w-full space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Evaluation Window Administration</h1> 
          <p className="text-sm text-slate-500 mt-1">Configure user role visibility toggles and active capture windows.</p>
        </div>
        <button className="inline-flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg shadow-sm transition">
          <Plus className="h-4 w-4" /> Initialize New Window
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-200">
          {windows.map((w, idx) => (
            <div key={idx} className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-slate-50/40 transition">
              <div className="flex gap-3.5 items-start">
                <div className={`p-2.5 rounded-xl border ${w.active ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">{w.period}</h3> [cite: 37]
                  <p className="text-xs text-slate-500 mt-0.5 font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Targeted Trigger Window: {w.windowOpens} [cite: 37]
                  </p>
                  <span className="text-xs text-slate-400 mt-1 block">Expected Workflow: {w.activity}</span> [cite: 37]
                </div>
              </div>

              <div className="flex items-center gap-3 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                <span className={`text-xs font-bold uppercase tracking-wider ${w.active ? "text-emerald-600" : "text-slate-400"}`}>
                  {w.active ? "Accepting Queries" : "Portal Window Locked"}
                </span>
                <button onClick={() => toggleTargetWindowStatus(idx)} className="text-slate-600 hover:text-indigo-600 transition">
                  {w.active ? <ToggleRight className="h-8 w-8 text-indigo-600" /> : <ToggleLeft className="h-8 w-8 text-slate-300" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
