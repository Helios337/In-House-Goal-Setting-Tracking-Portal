"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Plus, ClipboardList, CheckCircle2, AlertCircle, FileEdit } from "lucide-react";
import { useCurrentSheet, useGoalSheets } from "@/hooks/useGoalQueries";
import { apiErrorMessage } from "@/lib/api";
import { Spinner } from "@/components/ui/Spinner";

function formatStatus(status: string) {
  if (status === "APPROVED") return "Approved";
  if (status === "SUBMITTED") return "Pending";
  return "Draft";
}

export default function GoalsListPage() {
  const { status } = useSession();
  const authenticated = status === "authenticated";
  const {
    goalSheets,
    isLoading: sheetsLoading,
    isError: sheetsError,
  } = useGoalSheets();
  const {
    currentSheet,
    isLoading: currentLoading,
    isError: currentError,
  } = useCurrentSheet(authenticated);

  const loading = status === "loading" || (authenticated && (sheetsLoading || currentLoading));
  const error =
    sheetsError || currentError
      ? apiErrorMessage(sheetsError ?? currentError, "Could not load goal sheets.")
      : null;

  const currentSheetStatus = currentSheet?.status ?? null;
  const canCreateNewSheet = currentSheetStatus === null || currentSheetStatus === "DRAFT";

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Performance Trackers</h1>
          <p className="text-sm text-slate-500">
            Formulate, submit, and view alignment sheets across operational periods.
          </p>
        </div>
        {canCreateNewSheet ? (
          <Link
            href="/employee/goals/new"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
          >
            <Plus className="h-4 w-4" />
            {currentSheetStatus === "DRAFT" ? "Continue goal sheet" : "Formulate New Goal Sheet"}
          </Link>
        ) : (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Current sheet is pending or approved — view it below.
          </p>
        )}
      </div>

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-3">
          {error}
        </p>
      )}

      {goalSheets.length === 0 && !error && (
        <p className="text-sm text-slate-500">No goal sheets yet. Create one to get started.</p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {goalSheets.map((sheet) => {
          const displayStatus = formatStatus(sheet.status);
          const approved = sheet.status === "APPROVED";
          return (
            <div
              key={sheet.id}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-3 items-center">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {sheet.cycle_name || `Cycle ${sheet.cycle_id}`}
                    </h3>
                    <p className="text-xs text-slate-400">Sheet #{sheet.id}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    approved
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                      : "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20"
                  }`}
                >
                  {approved ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <AlertCircle className="h-3 w-3" />
                  )}
                  {displayStatus}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-sm">
                <div>
                  <span className="text-slate-400 block text-xs">Active Targets</span>
                  <span className="font-semibold text-slate-700">
                    {sheet.goal_count} Objectives
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Allocated Weightage</span>
                  <span
                    className={`font-semibold ${
                      sheet.total_weightage === 100 ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {sheet.total_weightage}% / 100%
                  </span>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <Link
                  href={`/employee/goals/${sheet.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  <FileEdit className="h-4 w-4 text-slate-400" />
                  Inspect Workspace
                </Link>
                {!approved && (
                  <Link
                    href="/employee/quarterly"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                  >
                    Log Progress
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
