"use client";

import React, { useEffect, useState } from "react";
import { fetchDashboard, downloadReportCsv, type DashboardStats } from "@/lib/goal-api";
import { ExportButton } from "@/components/reports/ExportButton";
import { Spinner } from "@/components/ui/Spinner";

export default function AdminReportsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard().then(setStats).finally(() => setLoading(false));
  }, []);

  const handleApiExport = async () => {
    const blob = await downloadReportCsv();
    const url = URL.createObjectURL(new Blob([blob]));
    const a = document.createElement("a");
    a.href = url;
    a.download = "team-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const exportRows =
    stats?.reports.map((r) => ({
      email: r.user_email,
      goal: r.goal_title,
      quarter: r.quarter,
      progress: r.progress,
    })) ?? [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Completion reports</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white border rounded-xl p-5">
          <p className="text-xs text-slate-500 uppercase">Users</p>
          <p className="text-2xl font-bold">{stats?.total_users ?? 0}</p>
        </div>
        <div className="bg-white border rounded-xl p-5">
          <p className="text-xs text-slate-500 uppercase">Avg progress</p>
          <p className="text-2xl font-bold">
            {Math.round(stats?.company_average_progress ?? 0)}%
          </p>
        </div>
        <div className="bg-white border rounded-xl p-5">
          <p className="text-xs text-slate-500 uppercase">Active cycles</p>
          <p className="text-2xl font-bold">{stats?.active_cycles ?? 0}</p>
        </div>
      </div>
      <div className="flex gap-3">
        <ExportButton data={exportRows} filename="achievement-report.csv" />
        <button
          onClick={handleApiExport}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Download manager CSV
        </button>
      </div>
    </div>
  );
}
