"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MessageSquare, ShieldCheck, ArrowLeft } from "lucide-react";
import { submitManagerCheckin } from "@/lib/goal-api";
import { invalidateGoalsCache } from "@/lib/invalidate-cache";
import { useEmployeeCheckin } from "@/hooks/useGoalQueries";
import { apiErrorMessage } from "@/lib/api";
import { Spinner } from "@/components/ui/Spinner";

export default function QuarterlyCheckInModule() {
  const params = useParams();
  const router = useRouter();
  const employeeId = Number(params.employeeId);
  const { checkinData, isLoading, isError } = useEmployeeCheckin(employeeId);
  const [commentary, setCommentary] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const metrics = checkinData?.goals ?? [];
  const goalSheetId = checkinData?.goal_sheet_id ?? null;
  const employeeEmail = checkinData?.employee_email ?? "";

  const handleSubmitCheckinLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentary.trim()) {
      setError("A documented check-in summary is required before committing.");
      return;
    }
    if (!goalSheetId) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitManagerCheckin({
        goal_sheet_id: goalSheetId,
        status: "COMPLETED",
        comment_text: commentary.trim(),
      });
      await invalidateGoalsCache();
      router.push("/manager/dashboard");
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to save check-in."));
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="p-6 text-rose-600">
        {apiErrorMessage(isError, "Could not load employee check-in data.")}
      </p>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 font-semibold uppercase tracking-wider"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Return to Pipeline
      </button>

      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">
          Quarterly Matrix Comparison & Discussion
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Reviewing execution performance for{" "}
          <span className="font-semibold text-slate-800">{employeeEmail || employeeId}</span>
        </p>
      </div>

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-3">
          {error}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          {metrics.length === 0 ? (
            <p className="text-sm text-slate-500">No goal metrics available for this employee.</p>
          ) : (
            metrics.map((m) => (
              <div
                key={m.goal_id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    {m.uom_type && (
                      <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                        UoM: {m.uom_type}
                      </span>
                    )}
                    <h3 className="font-semibold text-slate-800 mt-1.5">{m.title}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-xs uppercase font-bold tracking-wider">
                      System Score
                    </span>
                    <span className="text-lg font-bold text-indigo-600">
                      {Math.round(m.progress_score)}%
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3 text-sm">
                  <div>
                    <span className="text-slate-400 text-xs block">Planned Target</span>
                    <span className="font-semibold text-slate-700">
                      {m.target_value ?? "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Progress</span>
                    <span className="font-semibold text-slate-700">
                      {Math.round(m.progress_score)}%
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div>
          <form
            onSubmit={handleSubmitCheckinLog}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 sticky top-6"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">
              <MessageSquare className="h-4 w-4 text-indigo-500" />
              <span>Discussion Documentation Log</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Check-in Feedback Comment
              </label>
              <textarea
                required
                rows={5}
                value={commentary}
                onChange={(e) => setCommentary(e.target.value)}
                placeholder="Document operational feedback and performance barriers discussed..."
                className="w-full text-sm rounded-lg border-slate-200 focus:ring-1 focus:ring-indigo-500 text-slate-800 placeholder-slate-400"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition disabled:opacity-60"
            >
              <ShieldCheck className="h-4 w-4" /> Commit & Lock Progress
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
