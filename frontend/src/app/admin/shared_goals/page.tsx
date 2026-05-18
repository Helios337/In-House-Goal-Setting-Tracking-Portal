"use client";

import React, { useEffect, useState } from "react";
import { Share2, Users, AlertCircle } from "lucide-react";
import { adminCascadeKpi, fetchCascadeOptions, type CascadeOption } from "@/lib/goal-api";
import { Spinner } from "@/components/ui/Spinner";

export default function SharedKPIBroadcastWorkspace() {
  const [options, setOptions] = useState<CascadeOption[]>([]);
  const [managerId, setManagerId] = useState<number | "">("");
  const [goalId, setGoalId] = useState<number | "">("");
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCascadeOptions()
      .then(setOptions)
      .catch(() => setError("Could not load cascade options."))
      .finally(() => setLoading(false));
  }, []);

  const selectedManager = options.find((o) => o.manager_id === managerId);

  const toggleEmployee = (id: number) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const dispatchSharedKpiMatrix = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (!managerId || !goalId || selectedEmployees.length === 0) {
      setError("Select a manager, goal, and at least one recipient.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await adminCascadeKpi({
        manager_id: Number(managerId),
        goal_id: Number(goalId),
        employee_ids: selectedEmployees,
      });
      setMessage(
        `Cascade complete: ${result.pushed?.length ?? 0} pushed, ${result.skipped?.length ?? 0} skipped.`
      );
      setSelectedEmployees([]);
    } catch {
      setError("Failed to cascade KPI to selected employees.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Share2 className="text-indigo-600 h-5 w-5" /> Cascading Goal Alignment Console
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Broadcast manager KPIs into subordinate goal sheets via shared goal links.
        </p>
      </div>

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-3">
          {error}
        </p>
      )}
      {message && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
          {message}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <form
            onSubmit={dispatchSharedKpiMatrix}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4"
          >
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Source manager
              </label>
              <select
                value={managerId}
                onChange={(e) => {
                  setManagerId(e.target.value ? Number(e.target.value) : "");
                  setGoalId("");
                  setSelectedEmployees([]);
                }}
                className="w-full text-sm rounded-lg border-slate-200 bg-white text-slate-800"
              >
                <option value="">Select manager...</option>
                {options.map((o) => (
                  <option key={o.manager_id} value={o.manager_id}>
                    {o.manager_email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Goal to cascade
              </label>
              <select
                value={goalId}
                onChange={(e) => setGoalId(e.target.value ? Number(e.target.value) : "")}
                disabled={!selectedManager}
                className="w-full text-sm rounded-lg border-slate-200 bg-white text-slate-800 disabled:opacity-50"
              >
                <option value="">Select goal...</option>
                {selectedManager?.goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title} ({g.weightage}%)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Recipients
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-3">
                {selectedManager?.subordinates.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(s.id)}
                      onChange={() => toggleEmployee(s.id)}
                    />
                    {s.email}
                  </label>
                ))}
                {!selectedManager && (
                  <p className="text-xs text-slate-400">Select a manager first.</p>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg px-4 py-2 text-sm shadow-sm transition disabled:opacity-60"
              >
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
            Cascaded goals are linked as shared KPIs. Recipients must have an active DRAFT
            goal sheet for the link to succeed.
          </p>
        </div>
      </div>
    </div>
  );
}
