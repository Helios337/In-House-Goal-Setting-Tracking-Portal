"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, Undo2, ShieldAlert } from "lucide-react";
import { approveGoalSheet } from "@/lib/goal-api";
import { invalidateGoalsCache } from "@/lib/invalidate-cache";
import { useGoalSheet } from "@/hooks/useGoalQueries";
import { apiErrorMessage } from "@/lib/api";
import { Spinner } from "@/components/ui/Spinner";

export default function GoalSheetApprovalInspector() {
  const params = useParams();
  const router = useRouter();
  const sheetId = Number(params.goalSheetId);
  const { sheet, isLoading, isError } = useGoalSheet(sheetId);
  const [errorLog, setErrorLog] = useState<string | null>(null);

  const processApproval = async () => {
    if (!sheet) return;
    if (sheet.total_weightage !== 100) {
      setErrorLog(`Cannot approve: total weight is ${sheet.total_weightage}%.`);
      return;
    }
    try {
      await approveGoalSheet(sheet.id);
      await invalidateGoalsCache();
      router.push("/manager/dashboard");
    } catch (err) {
      setErrorLog(apiErrorMessage(err, "Approval failed."));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !sheet) {
    return (
      <p className="p-6 text-rose-600">
        {apiErrorMessage(isError, errorLog ?? "Could not load sheet.")}
      </p>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Approve goal sheet</h1>
          <p className="text-sm text-slate-500">
            Sheet #{sheet.id} · {sheet.status}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/manager/dashboard")}
            className="rounded-lg border px-4 py-2 text-sm font-semibold"
          >
            <Undo2 className="inline h-4 w-4 mr-1" /> Back
          </button>
          <button
            onClick={processApproval}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
          >
            <CheckCircle className="inline h-4 w-4 mr-1" /> Approve
          </button>
        </div>
      </div>

      {errorLog && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800 flex gap-2">
          <ShieldAlert className="h-5 w-5" /> {errorLog}
        </div>
      )}

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="p-3 text-left">Goal</th>
              <th className="p-3 text-right">Weight</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sheet.goals.map((g) => (
              <tr key={g.id}>
                <td className="p-3">{g.title}</td>
                <td className="p-3 text-right">{g.weightage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 bg-slate-50 text-right text-sm">
          Total: <strong>{sheet.total_weightage}%</strong>
        </div>
      </div>
    </div>
  );
}
