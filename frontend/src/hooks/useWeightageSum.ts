import { useMemo } from "react";

export function useWeightageSum(goals: Array<{ weightage?: number }>) {
  const total = useMemo(() => {
    return goals.reduce((sum, goal) => sum + (Number(goal.weightage) || 0), 0);
  }, [goals]);

  return {
    total,
    isValid: total === 100,
    isOver: total > 100,
    remaining: 100 - total,
  };
}
