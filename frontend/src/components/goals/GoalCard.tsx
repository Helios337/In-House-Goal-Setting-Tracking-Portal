import * as React from "react";
import { GoalStatusBadge, GoalStatus } from "./GoalStatusBadge";
import { Badge } from "@/components/ui/Badge";

export interface GoalCardProps {
  title: string;
  thrustArea: string;
  weightage: number;
  target: string;
  status: GoalStatus;
  isShared?: boolean;
  onEdit?: () => void;
}

export function GoalCard({ title, thrustArea, weightage, target, status, isShared, onEdit }: GoalCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            {title}
            {isShared && <Badge variant="info">Shared KPI</Badge>}
          </h4>
          <p className="text-sm text-slate-500">Thrust Area: {thrustArea}</p>
        </div>
        <GoalStatusBadge status={status} />
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 text-sm">
        <div>
          <span className="text-slate-500 block">Target</span>
          <span className="font-medium text-slate-900">{target}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Weightage</span>
          <span className="font-medium text-slate-900">{weightage}%</span>
        </div>
      </div>
      
      {onEdit && (
        <div className="mt-4 flex justify-end">
          <button onClick={onEdit} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            Edit Goal
          </button>
        </div>
      )}
    </div>
  );
}
