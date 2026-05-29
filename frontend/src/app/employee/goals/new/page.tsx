"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Trash2, Plus, AlertTriangle, Save, CheckCircle2, Clock } from "lucide-react";
import {
  createGoal,
  fetchCurrentSheet,
  fetchThrustAreas,
  submitGoalSheet,
  type GoalSheetDetail,
  type ThrustArea,
} from "@/lib/goal-api";
import { apiErrorMessage } from "@/lib/api";
import { goalSheetSchema, type GoalFormValues } from "@/lib/validators";
import { UoMSelector, type UoMType } from "@/components/goals/UoMSelector";

type GoalItem = GoalFormValues;

const emptyGoal = (defaultThrustAreaId: number): GoalItem => ({
  title: "",
  description: "",
  thrustAreaId: defaultThrustAreaId,
  uom: "Min (Numeric / %)",
  target: "100",
  weightage: 10,
  isShared: false,
});

export default function NewGoalSheet() {
  const router = useRouter();
  const { status } = useSession();
  const [thrustAreas, setThrustAreas] = useState<ThrustArea[]>([]);
  const [areasLoading, setAreasLoading] = useState(true);
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [errorLog, setErrorLog] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentSheet, setCurrentSheet] = useState<GoalSheetDetail | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated") {
      setAreasLoading(false);
      return;
    }

    let cancelled = false;
    setAreasLoading(true);
    setLoadError(null);
    (async () => {
      try {
        const [areas, sheet] = await Promise.all([fetchThrustAreas(), fetchCurrentSheet()]);
        if (cancelled) return;
        setThrustAreas(areas);
        setCurrentSheet(sheet);

        if (sheet.status === "DRAFT" && sheet.goals.length > 0) {
          router.replace(`/employee/goals/${sheet.id}`);
          return;
        }

        if (sheet.status !== "DRAFT") {
          return;
        }

        if (areas.length > 0) {
          setGoals([emptyGoal(areas[0].id)]);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            apiErrorMessage(err, "Could not load thrust areas. Check API connection and sign-in.")
          );
        }
      } finally {
        if (!cancelled) setAreasLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status]);

  const calculateTotalWeight = () =>
    goals.reduce((sum, g) => sum + (g.weightage || 0), 0);

  const handleAddField = () => {
    if (goals.length >= 8) {
      setErrorLog("Maximum 8 goals per sheet.");
      return;
    }
    const defaultId = thrustAreas[0]?.id ?? goals[0]?.thrustAreaId ?? 1;
    setGoals([...goals, emptyGoal(defaultId)]);
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
      const sheet = currentSheet ?? (await fetchCurrentSheet());
      if (sheet.status !== "DRAFT") {
        setErrorLog(`Cannot modify goals. Sheet is ${sheet.status}.`);
        return;
      }
      if (sheet.goals.length > 0) {
        setErrorLog(
          "This sheet already has saved goals. Open it from My Performance Trackers to view status."
        );
        return;
      }
      for (const item of parsed.data) {
        const targetNum = parseFloat(item.target);
        await createGoal({
          title: item.title.trim(),
          description: item.description,
          weightage: item.weightage,
          goal_sheet_id: sheet.id,
          uom_type: item.uom,
          target_value: Number.isNaN(targetNum) ? undefined : targetNum,
          thrust_area_id: item.thrustAreaId,
        });
      }
      await submitGoalSheet(sheet.id);
      router.push("/employee/goals");
    } catch (err: unknown) {
      setErrorLog(
        apiErrorMessage(err, "Failed to save goals. Check API connection and sheet status.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (areasLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto text-sm text-slate-500">Loading thrust areas…</div>
    );
  }

  if (loadError) {
    return (
      <div className="p-6 max-w-6xl mx-auto text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
        {loadError}
      </div>
    );
  }

  if (thrustAreas.length === 0) {
    return (
      <div className="p-6 max-w-6xl mx-auto text-sm text-rose-700">
        No thrust areas in the database. Run{" "}
        <code className="text-xs bg-rose-100 px-1 rounded">python scripts/seed.py</code> from the
        backend folder (with Postgres up), then refresh.
      </div>
    );
  }

  if (currentSheet && currentSheet.status !== "DRAFT") {
    const isApproved = currentSheet.status === "APPROVED";
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm text-center space-y-4">
          <div
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
              isApproved ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
            }`}
          >
            {isApproved ? (
              <CheckCircle2 className="h-7 w-7" />
            ) : (
              <Clock className="h-7 w-7" />
            )}
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            {isApproved ? "Goal sheet approved" : "Goal sheet submitted"}
          </h1>
          <p className="text-sm text-slate-600">
            {isApproved
              ? "Your manager has approved this cycle’s goals. You can log quarterly progress from your tracker list."
              : "Your goals are with your manager for approval. You cannot edit them until the sheet is returned to draft."}
          </p>
          <p className="text-xs text-slate-500">
            {currentSheet.goals.length} goal(s) · {currentSheet.total_weightage}% total weight
          </p>
          <Link
            href={`/employee/goals/${currentSheet.id}`}
            className="inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            View submitted sheet
          </Link>
          <Link
            href="/employee/goals"
            className="block text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Back to My Performance Trackers
          </Link>
        </div>
      </div>
    );
  }

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
                    value={item.thrustAreaId}
                    onChange={(e) =>
                      handleValueChange(idx, "thrustAreaId", parseInt(e.target.value, 10))
                    }
                    className="mt-1 w-full rounded-lg border-slate-200 text-sm"
                  >
                    {thrustAreas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
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
