import * as React from "react";
import { cn } from "@/lib/utils";
import { UoMType } from "../goals/UoMSelector";

interface ProgressScoreProps {
  uom: UoMType;
  target: string | number;
  actual: string | number;
}

export function ProgressScore({ uom, target, actual }: ProgressScoreProps) {
  const calculateScore = (): number => {
    const t = Number(target);
    const a = Number(actual);

    // Guard against NaN/Invalid inputs
    if (uom !== "Timeline" && (isNaN(t) || isNaN(a))) return 0;

    switch (uom) {
      case "Min (Numeric / %)":
        return t === 0 ? 0 : (a / t) * 100;
      case "Max (Numeric / %)":
        return a === 0 ? 100 : (t / a) * 100;
      case "Timeline":
        // Simplified date logic: If actual date <= target date, 100%, else 0% 
        // Note: Real world might use a sliding scale for days late.
        const tDate = new Date(target).getTime();
        const aDate = new Date(actual).getTime();
        if (isNaN(tDate) || isNaN(aDate)) return 0;
        return aDate <= tDate ? 100 : 0;
      case "Zero":
        return a === 0 ? 100 : 0;
      default:
        return 0;
    }
  };

  const score = calculateScore();
  const clampedScore = Math.min(Math.max(score, 0), 100);

  return (
    <div className="flex flex-col items-end">
      <span className={cn(
        "text-lg font-bold",
        clampedScore >= 100 ? "text-emerald-600" : clampedScore >= 50 ? "text-amber-600" : "text-red-600"
      )}>
        {clampedScore.toFixed(0)}%
      </span>
      <span className="text-xs text-slate-500 text-right w-32 truncate">
        System Computed
      </span>
    </div>
  );
}
