"use client";

import React, { useState } from "react";
import { FileSpreadsheet, Download, Filter, HelpCircle } from "lucide-react";

export default function PerformanceReportExporter() {
  const [exportCycle, setExportCycle] = useState("FY 2026 Normalization Lifecycle");
  const [isCompiling, setIsCompiling] = useState(false);

  const simulateSpreadsheetExport = (format: "CSV" | "Excel") => {
    setIsCompiling(true);
    setTimeout(() => {
      setIsCompiling(false);
      alert(`Corporate report generated successfully. Download initiated for: Target_Dataset_Export.${format.toLowerCase()}`); 
    }, 1200);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileSpreadsheet className="text-emerald-600 h-5 w-5" /> Reporting & Compliance Center
        </h1>
        <p className="text-sm text-slate-500 mt-1">Export complete performance records and planned metrics into local spreadsheet software.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" /> Select Evaluation Window Target Group
            </label>
            <select value={exportCycle} onChange={(e) => setExportCycle(e.target.value)} className="w-full text-sm rounded-lg border-slate-200 bg-white text-slate-800">
              <option>FY 2026 Normalization Lifecycle</option>
              <option>FY 2025 Historic Archival Audit</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => simulateSpreadsheetExport("CSV")}
              disabled={isCompiling}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2.5 text-sm shadow-sm transition disabled:opacity-40"
            >
              <Download className="h-4 w-4 text-slate-400" /> {isCompiling ? "Compiling Ledger..." : "Export as Comma Separated (CSV)"}
            </button>
            <button
              onClick={() => simulateSpreadsheetExport("Excel")}
              disabled={isCompiling}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2.5 text-sm shadow-sm transition disabled:opacity-40"
            >
              <FileSpreadsheet className="h-4 w-4" /> {isCompiling ? "Compiling Matrix..." : "Export Excel Spreadsheet"}
            </button>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 shadow-sm text-sm h-fit">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <HelpCircle className="h-4 w-4 text-slate-400" /> Export Details
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            The generated export bundles comprehensive performance data across the tenant environment. It correlates individual employee metrics, target parameters, actual achievements, L1 manager reviews, and computation indexes into a clean relational layout.
          </p>
        </div>
      </div>
    </div>
  );
}
