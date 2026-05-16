"use client";

import React, { useState } from "react";
import { ShieldCheck, Search, ShieldAlert, Terminal } from "lucide-react";

export default function AuditTrailComplianceViewer() {
  const [logs] = useState([
    { timestamp: "2026-05-16 14:22:05", operator: "HR_Admin_01", targetUser: "Sarah Jenkins (EMP-902)", action: "Admin Override Post-Lock Modification", metadata: "Altered target weight baseline from 30% to 40% due to L1 alignment request." }, [cite: 44]
    { timestamp: "2026-05-15 09:12:44", operator: "System_Daemon", targetUser: "All Engineers", action: "Shared Cascade KPI Synchronization Triggered", metadata: "Propagated core availability metric across 140 nested sheets automatically." } [cite: 26]
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Terminal className="text-slate-700 h-5 w-5" /> Immutable Verification Logs
        </h1>
        <p className="text-sm text-slate-500 mt-1">Tracks and flags data adjustments made after locking target sheets[cite: 44].</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Query UUID, user alias or actor identity..." className="pl-9 pr-4 py-1.5 w-full text-xs rounded-lg border-slate-200 focus:ring-1 focus:ring-indigo-500 text-slate-800" />
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> Ledger Intact
          </span>
        </div>

        <div className="divide-y divide-slate-100 font-mono text-xs">
          {logs.map((log, idx) => (
            <div key={idx} className="p-4 hover:bg-slate-50/50 transition space-y-2">
              <div className="flex flex-col sm:flex-row justify-between text-slate-400 gap-1">
                <span>Timestamp: <span className="text-slate-700 font-semibold">{log.timestamp}</span></span>
                <span className="text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">Operator: {log.operator}</span>
              </div>
              <div className="text-sm font-sans font-semibold text-slate-800 flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                <span>{log.action} &rarr; Target: <span className="text-slate-600 font-normal">{log.targetUser}</span></span>
              </div>
              <p className="text-xs font-sans text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">{log.metadata}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
