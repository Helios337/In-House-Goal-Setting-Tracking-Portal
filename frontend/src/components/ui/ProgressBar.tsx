import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // Percentage value out of 100
  max?: number;
  showText?: boolean;
  statusMode?: boolean; 
}

export function ProgressBar({ value, max = 100, showText = false, statusMode = false }: ProgressBarProps) {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

  // Dynamic bar colors optimized for HR tracking UI thresholds
  const getBarColor = () => {
    if (!statusMode) return "bg-blue-600";
    if (percentage < 40) return "bg-red-500";
    if (percentage < 100) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div className="w-full space-y-1.5">
      {showText && (
        <div className="flex justify-between text-xs font-medium text-slate-600">
          <span>Progress</span>
          <span>{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/40">
        <div
          className={cn("h-full transition-all duration-300 ease-out", getBarColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
