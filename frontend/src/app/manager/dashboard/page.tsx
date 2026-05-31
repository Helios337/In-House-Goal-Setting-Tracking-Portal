"use client";

import React from "react";
import Link from "next/link";
import { Users, RefreshCcw, LayoutDashboard, ArrowRight, ClipboardCheck } from "lucide-react";
import { usePendingApprovals, useTeamForCheckin } from "@/hooks/useGoalQueries";
import { apiErrorMessage } from "@/lib/api";
import { Spinner } from "@/components/ui/Spinner";

export default function ManagerDashboard() {
  const {
    pendingApprovals: teamSheets,
    isLoading: pendingLoading,
    isError: pendingError,
  } = usePendingApprovals();
  const {
    checkinTeam,
    isLoading: teamLoading,
    isError: teamError,
  } = useTeamForCheckin();

  const loading = pendingLoading || teamLoading;
  const error =
    pendingError || teamError
      ? apiErrorMessage(
          pendingError ?? teamError,
          "Could not load team queue. Sign in as manager@demo.example.com."
        )
      : null;

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <LayoutDashboard className="text-indigo-600 h-6 w-6" /> Team approvals
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review submitted goal sheets and quarterly check-ins from your direct reports.
        </p>
      </div>

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-3">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <RefreshCcw className="h-6 w-6" />
          </div>
          <div>
            <span className="text-slate-400 block text-xs uppercase font-bold">
              Pending reviews
            </span>
            <span className="text-xl font-bold text-slate-800">{teamSheets.length}</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-slate-400 block text-xs uppercase font-bold">
              Ready for check-in
            </span>
            <span className="text-xl font-bold text-slate-800">{checkinTeam.length}</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-sm text-slate-700">
          Awaiting verification
        </div>
        {teamSheets.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No sheets pending approval.</p>
        ) : (
          <div className="divide-y divide-slate-200">
            {teamSheets.map((sheet) => {
              const weightSum = sheet.goals.reduce((s, g) => s + g.weightage, 0);
              return (
                <div
                  key={sheet.goalSheetId}
                  className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div>
                    <h3 className="font-semibold text-slate-900">{sheet.employeeName}</h3>
                    <p className="text-xs text-slate-400">Sheet #{sheet.goalSheetId}</p>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-slate-400 block text-xs">Goals</span>
                      <span className="font-medium">{sheet.goals.length}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-xs">Weight</span>
                      <span
                        className={`font-semibold ${
                          weightSum === 100 ? "text-emerald-600" : "text-amber-600"
                        }`}
                      >
                        {weightSum}%
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/manager/approve/${sheet.goalSheetId}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Review <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-sm text-slate-700 flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4" /> Quarterly check-ins
        </div>
        {checkinTeam.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No approved sheets ready for check-in.</p>
        ) : (
          <div className="divide-y divide-slate-200">
            {checkinTeam.map((member) => (
              <div
                key={member.employee_id}
                className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div>
                  <h3 className="font-semibold text-slate-900">{member.employee_email}</h3>
                  <p className="text-xs text-slate-400">Sheet #{member.goal_sheet_id}</p>
                </div>
                <Link
                  href={`/manager/checkin/${member.employee_id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  Check in <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
