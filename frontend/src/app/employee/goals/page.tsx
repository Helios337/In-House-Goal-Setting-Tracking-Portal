"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, ClipboardList, CheckCircle2, AlertCircle, FileEdit } from "lucide-react";

export default function GoalsListPage() {
  // Mock data reflecting system validation boundaries
  const [goalSheets] = useState([
    { id: "sheet-2026", period: "FY 2026 Cycle", status: "Draft", goalCount: 3, totalWeight: 45 },
    { id: "sheet-2025", period: "FY 2025 Cycle", status: "Approved", goalCount: 6, totalWeight: 100 },
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Performance Trackers</h1>
          <p className="text-sm text-slate-500">Formulate, submit, and view alignment sheets across operational periods.</p>
        </div>
        <Link
          href="/employee/goals/new"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
        >
          <Plus className="h-4 w-4" />
          Formulate New Goal Sheet
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {goalSheets.map((sheet) => (
          <div key={sheet.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div className="flex gap-3 items-center">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{sheet.period}</h3>
                  <p className="text-xs text-slate-400">ID: {sheet.id.toUpperCase()}</p>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                sheet.status === "Approved" ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20" : "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20"
              }`}>
                {sheet.status === "Approved" ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                {sheet.status}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-sm">
              <div>
                <span className="text-slate-400 block text-xs">Active Targets</span>
                <span className="font-semibold text-slate-700">{sheet.goalCount} Objectives</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">Allocated Weightage</span>
                <span className={`font-semibold ${sheet.totalWeight === 100 ? "text-emerald-600" : "text-amber-600"}`}>
                  {sheet.totalWeight}% / 100%
                </span>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <Link
                href={`/employee/goals/${sheet.id}`}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <FileEdit className="h-4 w-4 text-slate-400" />
                Inspect Workspace
              </Link>
              {sheet.status !== "Approved" && (
                <Link
                  href="/employee/quarterly"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                >
                  Log Progress
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
