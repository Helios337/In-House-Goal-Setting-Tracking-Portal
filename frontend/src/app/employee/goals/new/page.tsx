"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Info, AlertTriangle, Save } from "lucide-react";

interface GoalItem {
  thrustArea: string;
  title: string;
  uom: string;
  target: string;
  weightage: number;
}

export default function NewGoalSheet() {
  const router = useRouter();
  const [goals, setGoals] = useState<GoalItem[]>([
    { thrustArea: "Sales Revenue", title: "", uom: "Numeric", target: "", weightage: 10 }
  ]);
  const [errorLog, setErrorLog] = useState<string | null>(null);

  const calculateTotalWeight = () => goals.reduce((sum, g) => sum + (g.weightage || 0), 0);

  const handleAddField = () => {
    if (goals.length >= 8) {
      setErrorLog("Business Rule Constraint: Maximum allocation allowance limit is 8 target objectives.");
      return;
    }
    setGoals([...goals, { thrustArea: "Sales Revenue", title: "", uom: "Numeric", target: "", weightage: 10 }]);
    setErrorLog(null);
  };

  const handleRemoveField = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const handleValueChange = (index: number, field: keyof GoalItem, value: any) => {
    const updated = [...goals];
    updated[index] = { ...updated[index], [field]: value };
    setGoals(updated);
  };

  const submitGoalSheet = (e: React.FormEvent) => {
    e.preventDefault();
    const sum = calculateTotalWeight();

    if (sum !== 100) {
      setErrorLog(`Validation Failed: Total systemic alignment weightage must equal exactly 100%. Currently evaluated at ${sum}%.`);
      return;
    }

    const belowMinItem = goals.some(g => g.weightage < 10);
    if (belowMinItem) {
      setErrorLog("Validation Failed: System enforces a minimum weightage floor threshold of 10% per specific line item.");
      return;
    }

    // Pass data layer validation checks
    setErrorLog(null);
    alert("Goal Sheet dispatched into verification processing stream effectively.");
    router.push("/employee/goals");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto w-full space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">Formulate Goal Lifecycle Matrix</h1>
        <p className="text-sm text-slate-500 mt-1">Configure parameters conforming cleanly to core compliance rulesets.</p>
      </div>

      {errorLog && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-rose-500 mt-0.5" />
          <div><span className="font-semibold">Compliance Exception Block:</span> {errorLog}</div>
        </div>
      )}

      <form onSubmit={submitGoalSheet} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="p-4">Thrust Area</th>
                <th className="p-4">Title / Definition</th>
                <th className="p-4">UoM Profile</th>
                <th className="p-4">Target Matrix</th>
                <th className="p-4 w-28">Weight (%)</th>
                <th className="p-4 text-center w-16">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {goals.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition">
                  <td className="p-3">
                    <select
                      value={item.thrustArea}
                      onChange={(e) => handleValueChange(idx, "thrustArea", e.target.value)}
                      className="w-full rounded-lg border-slate-200 text-slate-800 bg-white focus:ring-1 focus:ring-indigo-500"
                    >
                      <option>Sales Revenue</option>
                      <option>Operational TAT</option>
                      <option>Safety Compliance</option>
                      <option>Resource Scale</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      required
                      placeholder="Define specific metrics"
                      value={item.title}
                      onChange={(e) => handleValueChange(idx, "title", e.target.value)}
                      className="w-full rounded-lg border-slate-200 focus:ring-1 focus:ring-indigo-500 text-slate-800"
                    />
                  </td>
                  <td className="p-3">
                    <select
                      value={item.uom}
                      onChange={(e) => handleValueChange(idx, "uom", e.target.value)}
                      className="w-full rounded-lg border-slate-200 text-slate-800 bg-white focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="Numeric">Numeric (Higher Better)</option>
                      <option value="Max">Numeric (Lower Better)</option>
                      <option value="Timeline">Timeline (Date-based)</option>
                      <option value="Zero">Zero-based Target</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      required
                      placeholder="Target Metric"
                      value={item.target}
                      onChange={(e) => handleValueChange(idx, "target", e.target.value)}
                      className="w-full rounded-lg border-slate-200 focus:ring-1 focus:ring-indigo-500 text-slate-800"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      required
                      min="1"
                      value={item.weightage}
                      onChange={(e) => handleValueChange(idx, "weightage", parseInt(e.target.value) || 0)}
                      className="w-full rounded-lg border-slate-200 focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      disabled={goals.length === 1}
                      onClick={() => handleRemoveField(idx)}
                      className="text-slate-400 hover:text-rose-600 disabled:opacity-30 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
            <button
              type="button"
              onClick={handleAddField}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-500 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" /> Append New Goal Line
            </button>
            <div className="text-sm font-medium text-slate-700">
              Aggregated Sum Weight:{" "}
              <span className={`font-bold text-base ${calculateTotalWeight() === 100 ? "text-emerald-600" : "text-amber-600"}`}>
                {calculateTotalWeight()}%
              </span>{" "}
              / 100%
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Cancel Draft
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
          >
            <Save className="h-4 w-4" /> Finalize & Lock Matrix
          </button>
        </div>
      </form>
    </div>
  );
}
