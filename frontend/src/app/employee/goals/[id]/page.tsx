"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Lock, CheckCircle, Eye } from "lucide-react";

export default function TargetInspectionSheet() {
  const params = useParams();
  const router = useRouter();
  
  // Checking mock state attributes
  const [isLocked] = useState(true); 
  const [mockSheet] = useState({
    id: params.id,
    period: "FY 2026 Normalization Lifecycle",
    status: "Approved",
    goals: [
      { area: "Sales Revenue", title: "Scale Enterprise Retention ARR", target: "$1.2M", weight: 40, type: "Numeric" },
      { area: "Operational TAT", title: "Optimize Ticket Resolution Engine", target: "< 24 Hours", weight: 30, type: "Max" },
      { area: "Safety Compliance", title: "Zero Incident Security Breaches", target: "0 Occurrences", weight: 30, type: "Zero" }
    ]
  });

  return (
    <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
      <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition">
        <ArrowLeft className="h-4 w-4" /> Back to Workspace
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div>
          <span className="text-xs font-mono font-bold tracking-widest text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded">System Record Logs</span>
          <h1 className="text-xl font-bold text-slate-900 mt-2">{mockSheet.period}</h1>
          <p className="text-sm text-slate-400">Sheet UUID Token Reference: {mockSheet.id}</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 text-slate-100 rounded-lg px-3 py-1.5 text-sm font-medium">
          <Lock className="h-4 w-4 text-amber-400" />
          <span>Locked Post Approval</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-sm text-slate-700 flex items-center gap-2">
          <Eye className="h-4 w-4 text-slate-400" /> Objective Framework Overview
        </div>
        <div className="divide-y divide-slate-100">
          {mockSheet.goals.map((g, index) => (
            <div key={index} className="p-5 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-slate-50/50 transition">
              <div className="space-y-1">
                <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{g.area}</span>
                <h4 className="text-base font-semibold text-slate-800">{g.title}</h4>
                <p className="text-xs text-slate-400">Computational Formula Pattern Type: <span className="font-medium text-slate-600">{g.type}</span></p>
              </div>
              <div className="flex items-center gap-8 text-sm">
                <div>
                  <span className="text-slate-400 block text-xs">Target Goal Matrix</span>
                  <span className="font-bold text-slate-700">{g.target}</span>
                </div>
                <div className="min-w-[60px]">
                  <span className="text-slate-400 block text-xs">Allocated Weight</span>
                  <span className="font-bold text-slate-900">{g.weight}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
