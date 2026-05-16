"use client";

import React, { useState } from "react";
import { Share2, Users, AlertCircle, ShieldEllipsis } from "lucide-react";

export default function SharedKPIBroadcastWorkspace() {
  const [kpiTitle, setKpiTitle] = useState("");
  const [kpiTarget, setKpiTarget] = useState("");
  const [targetGroup, setTargetGroup] = useState("All Engineering Associates");

  const dispatchSharedKpiMatrix = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kpiTitle || !kpiTarget) {
      alert("Please configure the target criteria fields fully before broadcasting.");
      return;
    }
    alert(`Departmental KPI broadcasted to group "${targetGroup}" as a read-only parameter.`); [cite: 24, 25]
    setKpiTitle("");
    setKpiTarget("");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Share2 className="text-indigo-600 h-5 w-5" /> Cascading Goal Alignment Console
        </h1>
        <p className="text-sm text-slate-500 mt-1">Broadcast high-level corporate KPIs directly into multiple child goal sheets[cite: 24].</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <form onSubmit={dispatchSharedKpiMatrix} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Cascade Matrix Target Group</label>
                <select value={targetGroup} onChange={(e) => setTargetGroup(e.target.value)} className="w-full text-sm rounded-lg border-slate-200 bg-white text-slate-800">
                  <option>All Engineering Associates</option>
                  <option>Customer Retention Squads</option>
                  <option>Enterprise Account Executives</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Shared Goal Title (Read-Only to Recipients)</label> 
                <input
                  type="text"
                  required
                  placeholder="e.g., Maintain 99.99% Core System Availability uptime threshold"
                  value={kpiTitle}
                  onChange={(e) => setKpiTitle(e.target.value)}
                  className="w-full text-sm rounded-lg border-slate-200 text-slate-800 placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Target Baseline Value</label> 
                <input
                  type="text"
                  required
                  placeholder="e.g., 99.99%"
                  value={kpiTarget}
                  onChange={(e) => setKpiTarget(e.target.value)}
                  className="w-full text-sm rounded-lg border-slate-200 text-slate-800 placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Thrust Area Blueprint</label>
                <select className="w-full text-sm rounded-lg border-slate-200 bg-white text-slate-800">
                  <option>Operational TAT</option>
                  <option>Sales Revenue</option>
                  <option>Safety Compliance</option>
                </select>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-end">
              <button type="submit" className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg px-4 py-2 text-sm shadow-sm transition">
                <Users className="h-4 w-4" /> Push Cascading KPI
              </button>
            </div>
          </form>
        </div>

        <div className="bg-slate-900 text-slate-100 rounded-xl p-5 space-y-4 shadow-sm h-fit">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm border-b border-slate-800 pb-2">
            <AlertCircle className="h-4 w-4" /> Structural Constraint Alert
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Cascaded goal definitions are pushed directly as <span className="text-slate-200 font-semibold">Immutable Fields</span>. 
            Recipients can modify their individual target weight distributions, but titles and standard targets remain locked to ensure consistent org-wide metrics.
          </p>
        </div>
      </div>
    </div>
  );
}
