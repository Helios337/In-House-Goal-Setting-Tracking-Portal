"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MessageSquare, Calculator, ShieldCheck, ArrowLeft } from "lucide-react";

export default function QuarterlyCheckInModule() {
  const params = useParams();
  const router = useRouter();
  const [commentary, setCommentary] = useState("");
  
  const [metrics] = useState([
    { title: "Scale Enterprise ARR", formulaType: "Min", target: 100, actual: 85 },
    { title: "Optimize Ticket Resolution Engine (TAT)", formulaType: "Max", target: 24, actual: 20 },
    { title: "Zero Incident Security Breaches", formulaType: "Zero", target: 0, actual: 1 }
  ]);

  const computeProgressScore = (type: string, target: number, actual: number): string => {
    if (target === 0 || !actual) return "0%";
    switch (type) {
      case "Min": return `${Math.round((actual / target) * 100)}%`; [cite: 34]
      case "Max": return `${Math.round((target / actual) * 100)}%`; [cite: 34]
      case "Zero": return actual === 0 ? "100%" : "0%"; [cite: 34]
      default: return "0%";
    }
  };

  const handleSubmitCheckinLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentary.trim()) {
      alert("A documented check-in summary is required before committing the state entry."); [cite: 32]
      return;
    }
    alert("Evaluation snapshot and structured discussion feedback recorded successfully."); 
    router.push("/manager/dashboard");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
      <button onClick={() => router.back()} className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 font-semibold uppercase tracking-wider">
        <ArrowLeft className="h-3.5 w-3.5" /> Return to Pipeline
      </button>

      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Quarterly Matrix Comparison & Discussion</h1>
        <p className="text-sm text-slate-500 mt-1">Reviewing execution performance metrics for Associate: <span className="font-semibold text-slate-800">{params.employeeId}</span></p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          {metrics.map((m, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded">Formula Model: {m.formulaType}</span> [cite: 34]
                  <h3 className="font-semibold text-slate-800 mt-1.5">{m.title}</h3>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-xs uppercase font-bold tracking-wider">System Score</span> 
                  <span className="text-lg font-bold text-indigo-600">{computeProgressScore(m.formulaType, m.target, m.actual)}</span> [cite: 34]
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3 text-sm">
                <div><span className="text-slate-400 text-xs block">Planned Target Metric</span><span className="font-semibold text-slate-700">{m.target}</span></div> 
                <div><span className="text-slate-400 text-xs block">Employee Actual Entry</span><span className="font-semibold text-slate-700">{m.actual}</span></div> 
              </div>
            </div>
          ))}
        </div>

        <div>
          <form onSubmit={handleSubmitCheckinLog} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 sticky top-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">
              <MessageSquare className="h-4 w-4 text-indigo-500" />
              <span>Discussion Documentation Log</span> [cite: 32]
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Check-in Feedback Comment</label> 
              <textarea
                required
                rows={5}
                value={commentary}
                onChange={(e) => setCommentary(e.target.value)}
                placeholder="Document operational feedback, trajectory modifications, and systemic performance barriers discussed..."
                className="w-full text-sm rounded-lg border-slate-200 focus:ring-1 focus:ring-indigo-500 text-slate-800 placeholder-slate-400"
              />
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
            >
              <ShieldCheck className="h-4 w-4" /> Commit & Lock Progress
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
