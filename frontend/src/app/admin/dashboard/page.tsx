"use client";

import React, { useState } from "react";
import { Building2, CheckCircle, PieChart, Users, ShieldAlert } from "lucide-react";

export default function AdminGovernanceDashboard() {
  const [departments] = useState([
    { name: "Global Engineering Operations", targetCount: 140, trackingCaptured: 92 },
    { name: "Enterprise Customer Success", targetCount: 85, trackingCaptured: 100 },
    { name: "Product Strategy & Design", targetCount: 45, trackingCaptured: 60 },
    { name: "Strategic Sales & Marketing", targetCount: 110, trackingCaptured: 34 }
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Systemic Completion & Compliance Deck</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time macro analytics across organizational departments.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><Users className="h-5 w-5" /></div>
          <div><span className="text-slate-400 block text-xs font-semibold uppercase tracking-wider">Active Directory Pool</span><span className="text-xl font-bold text-slate-800">380 Employees</span></div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle className="h-5 w-5" /></div>
          <div><span className="text-slate-400 block text-xs font-semibold uppercase tracking-wider">Completed Sheets</span><span className="text-xl font-bold text-slate-800">286 Locked</span></div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">Cross-Departmental Tracking Status Heatmap</h3>
          <p className="text-xs text-slate-400">Tracks employee cycles closed against total structural dependencies.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {departments.map((dept, idx) => (
            <div key={idx} className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3">
              <div className="flex justify-between items-start gap-2">
                <span className="font-semibold text-sm text-slate-800 line-clamp-1">{dept.name}</span>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">{dept.trackingCaptured}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    dept.trackingCaptured >= 90 ? "bg-emerald-500" : dept.trackingCaptured >= 60 ? "bg-amber-500" : "bg-rose-500"
                  }`}
                  style={{ width: `${dept.trackingCaptured}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 font-medium">Verified Records: {dept.targetCount} Objectives Tracked</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
