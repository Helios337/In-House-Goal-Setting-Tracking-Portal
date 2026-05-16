import * as React from "react";
import { DataTable } from "@/components/ui/DataTable";
import { ProgressScore } from "./ProgressScore";
import { UoMType } from "../goals/UoMSelector";

export interface CheckInRecord {
  id: string;
  goalTitle: string;
  uom: UoMType;
  plannedTarget: string;
  actualAchievement: string;
  status: string;
}

interface PlannedVsActualProps {
  data: CheckInRecord[];
}

export function PlannedVsActual({ data }: PlannedVsActualProps) {
  const columns = [
    { header: "Goal", accessorKey: "goalTitle" },
    { header: "UoM", accessorKey: "uom" },
    { 
      header: "Planned Target", 
      accessorKey: "plannedTarget",
      cell: (row: CheckInRecord) => <span className="font-medium text-slate-700">{row.plannedTarget}</span>
    },
    { 
      header: "Actual Achievement", 
      accessorKey: "actualAchievement",
      cell: (row: CheckInRecord) => <span className="font-medium text-blue-700">{row.actualAchievement || "-"}</span>
    },
    {
      header: "Progress Score",
      accessorKey: "score",
      cell: (row: CheckInRecord) => (
        row.actualAchievement ? (
          <ProgressScore uom={row.uom} target={row.plannedTarget} actual={row.actualAchievement} />
        ) : <span className="text-slate-400">Pending</span>
      )
    }
  ];

  return (
    <div className="bg-white rounded-lg p-1">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 px-2">Planned vs. Actual Achievement</h3>
      <DataTable columns={columns} data={data} emptyMessage="No active goals to track." />
    </div>
  );
}
