"use client";

import React, { useState } from "react";
import { ShieldCheck, Search, ShieldAlert } from "lucide-react";
import { useAuditLog } from "@/hooks/useAuditLog";
import { Spinner } from "@/components/ui/Spinner";

export default function AuditTrailComplianceViewer() {
  const [page, setPage] = useState(1);
  const { logs, totalPages, isLoading, isError } = useAuditLog(page);

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Audit log</h1>
        <p className="text-sm text-slate-500 mt-1">Immutable record of goal and sheet changes.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 flex justify-center"><Spinner /></div>
        ) : isError ? (
          <p className="p-6 text-rose-600 text-sm">Failed to load audit logs.</p>
        ) : (
          <>
            <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
              <Search className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-mono text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> {logs.length} entries
              </span>
            </div>
            <div className="divide-y font-mono text-xs">
              {logs.map((log) => (
                <div key={log.id} className="p-4 space-y-1">
                  <div className="text-slate-500">{log.timestamp}</div>
                  <div className="font-sans font-semibold text-slate-800 flex gap-1">
                    <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                    {log.action} — {log.performedBy}
                  </div>
                  <p className="font-sans text-slate-500">{log.details}</p>
                </div>
              ))}
            </div>
            <div className="p-4 flex justify-between border-t">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="text-sm disabled:opacity-40">Previous</button>
              <span className="text-xs text-slate-500">Page {page} / {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="text-sm disabled:opacity-40">Next</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
