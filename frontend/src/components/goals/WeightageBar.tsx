import * as React from "react";
import { cn } from "@/lib/utils";

interface WeightageBarProps {
  currentTotal: number;
}

export function WeightageBar({ currentTotal }: WeightageBarProps) {
  const isOver = currentTotal > 100;
  const isPerfect = currentTotal === 100;

  let barColor = "bg-blue-500";
  if (isPerfect) barColor = "bg-emerald-500";
  if (isOver) barColor = "bg-red-500";

  return (
    <div className="w-full space-y-2 p-4 bg-slate-50 border border-slate-200 rounded-lg">
      <div className="flex justify-between items-center text-sm font-medium">
        <span className="text-slate-700">Total Goal Weightage Allocation</span>
        <span className={cn(
          "px-2 py-0.5 rounded text-xs",
          isPerfect ? "bg-emerald-100 text-emerald-700" : 
          isOver ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
        )}>
          {currentTotal}% / 100%
        </span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
        <div
          className={cn("h-full transition-all duration-300", barColor)}
          style={{ width: `${Math.min(currentTotal, 100)}%` }}
        />
      </div>
      {isOver && <p className="text-xs text-red-600">Total weightage cannot exceed 100%.</p>}
      {!isPerfect && !isOver && <p className="text-xs text-amber-600">You must allocate exactly 100% before submission.</p>}
    </div>
  );
}
