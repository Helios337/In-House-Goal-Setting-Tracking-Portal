"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useGoalSheet } from "@/hooks/useGoalQueries";
import { apiErrorMessage } from "@/lib/api";
import { Spinner } from "@/components/ui/Spinner";

export default function GoalSheetDetailPage() {
  const params = useParams();
  const sheetId = Number(params.id);
  const { sheet, isLoading, isError } = useGoalSheet(sheetId);

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
        {apiErrorMessage(isError, "Could not load goal sheet.")}
      </p>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {sheet.cycle_name || `Cycle ${sheet.cycle_id}`}
        </h1>
        <p className="text-sm text-slate-500">
          Sheet #{sheet.id} · Status: {sheet.status} · Weight: {sheet.total_weightage}%
        </p>
        {sheet.status === "SUBMITTED" && (
          <p className="mt-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Waiting for manager approval. Goals cannot be edited while submitted.
          </p>
        )}
        {sheet.status === "APPROVED" && (
          <p className="mt-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
            Approved. Use quarterly progress logging from your tracker list when the check-in phase
            is open.
          </p>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="p-3 text-left">Goal</th>
              <th className="p-3 text-right">Weight</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sheet.goals.map((g) => (
              <tr key={g.id}>
                <td className="p-3 font-medium text-slate-800">{g.title}</td>
                <td className="p-3 text-right text-slate-600">{g.weightage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
