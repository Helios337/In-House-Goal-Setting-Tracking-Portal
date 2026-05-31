"use client";

import React from "react";
import { useDashboardStats } from "@/hooks/useGoalQueries";
import { CompletionHeatmap } from "@/components/reports/CompletionHeatmap";
import { Spinner } from "@/components/ui/Spinner";

export default function AdminGovernanceDashboard() {
  const { stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Admin dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-white border rounded-xl p-5">
          <p className="text-xs text-slate-500 uppercase">Total users</p>
          <p className="text-2xl font-bold">{stats?.total_users ?? 0}</p>
        </div>
        <div className="bg-white border rounded-xl p-5">
          <p className="text-xs text-slate-500 uppercase">Company avg progress</p>
          <p className="text-2xl font-bold">
            {Math.round(stats?.company_average_progress ?? 0)}%
          </p>
        </div>
        <div className="bg-white border rounded-xl p-5">
          <p className="text-xs text-slate-500 uppercase">Report rows</p>
          <p className="text-2xl font-bold">{stats?.reports?.length ?? 0}</p>
        </div>
      </div>
      {stats?.team_completion && stats.team_completion.length > 0 && (
        <CompletionHeatmap data={stats.team_completion} />
      )}
    </div>
  );
}
