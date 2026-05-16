import * as React from "react";
import { cn } from "@/lib/utils";

export interface DepartmentStats {
  department: string;
  totalEmployees: number;
  completedCheckins: number;
}

interface CompletionHeatmapProps {
  data: DepartmentStats[];
}

export function CompletionHeatmap({ data }: CompletionHeatmapProps) {
  // Helper to determine heatmap color block based on completion percentage
  const getHeatmapColor = (percentage: number) => {
    if (percentage === 0) return "bg-slate-100 text-slate-400 border-slate-200";
    if (percentage < 30) return "bg-red-100 text-red-700 border-red-200";
    if (percentage < 70) return "bg-amber-100 text-amber-700 border-amber-200";
    if (percentage < 100) return "bg-emerald-100 text-emerald-700 border-emerald-200";
    return "bg-emerald-500 text-white border-emerald-600"; // 100% complete
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Org-wide Check-in Completion</h3>
          <p className="text-sm text-slate-500">Quarterly progress by department</p>
        </div>
        <div className="flex gap-2 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-100 border border-red-200 rounded-sm"></div> &lt;30%</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-100 border border-amber-200 rounded-sm"></div> &lt;70%</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500 border border-emerald-600 rounded-sm"></div> 100%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((dept) => {
          const completionRate = dept.totalEmployees === 0 
            ? 0 
            : Math.round((dept.completedCheckins / dept.totalEmployees) * 100);

          return (
            <div 
              key={dept.department} 
              className={cn(
                "p-4 rounded-lg border transition-all hover:shadow-md",
                getHeatmapColor(completionRate)
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold">{dept.department}</span>
                <span className="text-lg font-bold">{completionRate}%</span>
              </div>
              <div className="text-sm opacity-80 mt-2">
                {dept.completedCheckins} of {dept.totalEmployees} employees completed
              </div>
              
              {/* Mini sparkline bar inside the block */}
              <div className="w-full bg-white/40 rounded-full h-1.5 mt-3 overflow-hidden">
                <div 
                  className="bg-current h-full" 
                  style={{ width: `${completionRate}%` }} 
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
