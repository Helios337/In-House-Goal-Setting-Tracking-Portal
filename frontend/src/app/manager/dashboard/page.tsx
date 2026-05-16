"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Users, FileCheck, RefreshCcw, LayoutDashboard, ArrowRight } from "lucide-react";

export default function ManagerDashboard() {
  const [teamSheets, setTeamSheets] = useState([
    { id: "EMP-902", owner: "Sarah Jenkins", role: "Frontend Dev", targetCount: 4, weightageSum: 100, verification: "Pending Approval" },
    { id: "EMP-411", owner: "Marcus Chen", role: "Data Engineer", targetCount: 5, weightageSum: 80, verification: "Rework Requested" }
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <LayoutDashboard className="text-indigo-600 h-6 w-6" /> L1 Strategic Operations Deck
        </h1>
        <p className="text-sm text-slate-500 mt-1">Review alignment targets, modify weight distributions inline, or send objectives back for updates.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><Users className="h-6 w-6" /></div>
          <div><span className="text-slate-400 block text-xs uppercase font-bold">Total Direct Reports</span><span className="text-xl font-bold text-slate-800">8 Members</span></div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><RefreshCcw className="h-6 w-6" /></div>
          <div><span className="text-slate-400 block text-xs uppercase font-bold">Action Reviews Due</span><span className="text-xl font-bold text-slate-800">{teamSheets.length} Sheets</span></div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-sm text-slate-700">
          Awaiting Verification Queue
        </div>
        <div className="divide-y divide-slate-200">
          {teamSheets.map((sheet) => (
            <div key={sheet.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/50 transition">
              <div>
                <h3 className="font-semibold text-slate-900 text-base">{sheet.owner}</h3>
                <p className="text-xs text-slate-400">{sheet.role} • ID Ref: {sheet.id}</p>
              </div>

              <div className="flex gap-6 text-sm text-center sm:text-left">
                <div>
                  <span className="text-slate-400 block text-xs">Goal Configuration</span>
                  <span className="font-medium text-slate-800">{sheet.targetCount} Targets</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Total Weightage</span>
                  <span className={`font-semibold ${sheet.weightageSum === 100 ? "text-emerald-600" : "text-amber-600"}`}>
                    {sheet.weightageSum}% / 100%
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Status Verification</span>
                  <span className={`inline-flex items-center text-xs font-semibold ${sheet.verification === "Pending Approval" ? "text-amber-600" : "text-rose-600"}`}>
                    {sheet.verification}
                  </span>
                </div>
              </div>

              <div>
                <Link
                  href={`/manager/approve/${sheet.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition"
                >
                  Evaluate Form <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
