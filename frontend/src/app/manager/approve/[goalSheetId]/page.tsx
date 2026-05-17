"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, Undo2, AlertCircle, ShieldAlert, Save } from "lucide-react";

interface EditableGoal {
  id: string;
  thrustArea: string;
  title: string;
  uom: string;
  target: string;
  weightage: number;
}

export default function GoalSheetApprovalInspector() {
  const params = useParams();
  const router = useRouter();
  const [goals, setGoals] = useState<EditableGoal[]>([]);
  const [errorLog, setErrorLog] = useState<string | null>(null);

  useEffect(() => {
    // Mimicking relational extraction logic for a single sheet entity
    setGoals([
      { id: "g-101", thrustArea: "Sales Revenue", title: "Scale Enterprise ARR", uom: "Numeric", target: "1200000", weightage: 50 },
      { id: "g-102", thrustArea: "Operational TAT", title: "Optimize Ticket Resolution Engine", uom: "Max", target: "24", weightage: 50 }
    ]);
  }, [params.goalSheetId]);

  const calculateTotalWeight = () => goals.reduce((sum, g) => sum + g.weightage, 0);

  const handleFieldUpdate = (idx: number, field: keyof EditableGoal, value: any) => {
    const next = [...goals];
    next[idx] = { ...next[idx], [field]: value };
    setGoals(next);
  };

  const processApproval = () => {
    const sum = calculateTotalWeight();
    if (sum !== 100) {
      setErrorLog(`Cannot Approve: The current total weight allocation stands at ${sum}%. System strictly enforces exactly 100%.`);
      return;
    }
    if (goals.some(g => g.weightage < 10)) {
      setErrorLog("Cannot Approve: Individual row validation failure. A minimum threshold weightage of 10% is required per item.");
      return;
    }
    setErrorLog(null);
    alert("Goal sheet marked as Approved. Framework state locked across the tenant registry."); 
    router.push("/manager/dashboard");
  };

  const processReworkRejection = () => {
    alert("Goal tracking sheet routed back to employee repository with an inline rework request flag.");
    router.push("/manager/dashboard");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inline Workflow Evaluation Desk</h1>
          <p className="text-sm text-slate-500">Reviewing target sheet: <span className="font-mono font-bold text-indigo-600 uppercase">{params.goalSheetId}</span></p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={processReworkRejection}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <Undo2 className="h-4 w-4 text-slate-400" /> Return for Rework
          </button>
          <button
            onClick={processApproval}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
          >
            <CheckCircle className="h-4 w-4" /> Approve & Lock Matrix
          </button>
        </div>
      </div>

      {errorLog && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 flex-shrink-0 text-rose-500 mt-0.5" />
          <div><span className="font-semibold">Validation Blocking Constraint:</span> {errorLog}</div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
            <tr>
              <th className="p-4">Thrust Area</th>
              <th className="p-4">Objective Definition</th>
              <th className="p-4 w-44">Target Field (Inline)</th>
              <th className="p-4 w-32">Weight % (Inline)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {goals.map((g, idx) => (
              <tr key={g.id} className="hover:bg-slate-50/40 transition">
                <td className="p-4 font-medium text-slate-700">{g.thrustArea}</td>
                <td className="p-4 text-slate-900 font-semibold">{g.title} <span className="text-xs text-slate-400 block font-normal">Formula Category: {g.uom}</span></td>
                <td className="p-4">
                  <input
                    type="text"
                    value={g.target}
                    onChange={(e) => handleFieldUpdate(idx, "target", e.target.value)}
                    className="w-full rounded-lg border-slate-200 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-800 font-medium"
                  />
                </td>
                <td className="p-4">
                  <input
                    type="number"
                    value={g.weightage}
                    onChange={(e) => handleFieldUpdate(idx, "weightage", parseInt(e.target.value) || 0)}
                    className="w-full rounded-lg border-slate-200 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-800 font-bold"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end text-sm font-medium text-slate-700">
          Aggregated Allocation Metric: &nbsp;
          <span className={`font-bold ${calculateTotalWeight() === 100 ? "text-emerald-600" : "text-amber-600"}`}>
            {calculateTotalWeight()}% / 100%
          </span>
        </div>
      </div>
    </div>
  );
}
