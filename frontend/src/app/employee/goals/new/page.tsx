"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus, AlertTriangle, Save } from "lucide-react";
import { createGoal, fetchCurrentSheet, submitGoalSheet } from "@/lib/goal-api";
import { goalSheetSchema, type GoalFormValues } from "@/lib/validators";
import { UoMSelector, type UoMType } from "@/components/goals/UoMSelector";

const THRUST_AREAS = ["Sales Revenue", "Operational TAT", "Safety Compliance"];

type GoalItem = GoalFormValues;

const emptyGoal = (): GoalItem => ({
  title: "",
  description: "",
  thrustArea: THRUST_AREAS[0],
  uom: "Min (Numeric / %)",
  target: "100",
  weightage: 10,
  isShared: false,
});

export default function NewGoalSheet() {
  const router = useRouter();
  const [goals, setGoals] = useState<GoalItem[]>([emptyGoal()]);
  const [errorLog, setErrorLog] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const calculateTotalWeight = () =>
    goals.reduce((sum, g) => sum + (g.weightage || 0), 0);

  const handleAddField = () => {
    if (goals.length >= 8) {
      setErrorLog("Maximum 8 goals per sheet.");
      return;
    }
    setGoals([...goals, emptyGoal()]);
    setErrorLog(null);
  };

  const handleRemoveField = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const handleValueChange = <K extends keyof GoalItem>(
    index: number,
    field: K,
    value: GoalItem[K]
  ) => {
    const updated = [...goals];
    updated[index] = { ...updated[index], [field]: value };
    setGoals(updated);
  };

  const submitGoalSheetForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = goalSheetSchema.safeParse(goals);
    if (!parsed.success) {
      setErrorLog(parsed.error.errors[0]?.message ?? "Invalid goal sheet.");
      return;
    }

    setSubmitting(true);
    setErrorLog(null);
    try {
      const sheet = await fetchCurrentSheet();
      for (const item of parsed.data) {
        const targetNum = parseFloat(item.target);
        await createGoal({
          title: item.title.trim(),
          description: item.description,
          weightage: item.weightage,
          goal_sheet_id: sheet.id,
          uom_type: item.uom,
          target_value: Number.isNaN(targetNum) ? undefined : targetNum,
          // TODO: resolve thrust area name -> id via /thrust-areas endpoint when available
        });
      }
      await submitGoalSheet(sheet.id);
      router.push("/employee/goals");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : null;
      setErrorLog(
        typeof message === "string"
          ? message
          : "Failed to save goals. Check API connection and sheet status."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto w-full space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Create Goal Sheet</h1>
        <p className="text-sm text-slate-500 mt-1">
          Add up to 8 goals totaling 100% weight, then submit for manager approval.
        </p>
      </div>

      {errorLog && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-rose-500 mt-0.5" />
          <div>{errorLog}</div>
        </div>
      )}

      <form onSubmit={submitGoalSheetForm} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100">
            {goals.map((item, idx) => (
              <div key={idx} className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6 items-end">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Goal title"
                    value={item.title}
                    onChange={(e) => handleValueChange(idx, "title", e.target.value)}
                    className="mt-1 w-full rounded-lg border-slate-200 focus:ring-1 focus:ring-indigo-500 text-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Thrust area</label>
                  <select
                    value={item.thrustArea}
                    onChange={(e) => handleValueChange(idx, "thrustArea", e.target.value)}
                    className="mt-1 w-full rounded-lg border-slate-200 text-sm"
                  >
                    {THRUST_AREAS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <UoMSelector
                    value={item.uom as UoMType}
                    onChange={(uom) => handleValueChange(idx, "uom", uom)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Target</label>
                  <input
                    type="text"
                    required
                    value={item.target}
                    onChange={(e) => handleValueChange(idx, "target", e.target.value)}
                    className="mt-1 w-full rounded-lg border-slate-200 text-sm"
                  />
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Weight %</label>
                    <input
                      type="number"
                      required
                      min={10}
                      max={100}
                      value={item.weightage}
                      onChange={(e) =>
                        handleValueChange(idx, "weightage", parseInt(e.target.value) || 0)
                      }
                      className="mt-1 w-full rounded-lg border-slate-200 text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={goals.length === 1}
                    onClick={() => handleRemoveField(idx)}
                    className="text-slate-400 hover:text-rose-600 disabled:opacity-30 p-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
            <button
              type="button"
              onClick={handleAddField}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-white border border-slate-200 rounded-lg px-3 py-2"
            >
              <Plus className="h-3.5 w-3.5" /> Add goal
            </button>
            <span className="text-sm font-medium">
              Total:{" "}
              <strong
                className={
                  calculateTotalWeight() === 100 ? "text-emerald-600" : "text-amber-600"
                }
              >
                {calculateTotalWeight()}%
              </strong>{" "}
              / 100%
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {submitting ? "Submitting…" : "Submit for approval"}
          </button>
        </div>
      </form>
    </div>
  );
}
