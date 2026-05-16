import useSWR from "swr";
import { api } from "@/lib/api";
import { GoalFormValues } from "@/lib/validators";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export function useGoals(cycleId?: string) {
  // Pass cycleId to fetch historical goals if needed
  const endpoint = cycleId ? `/goals?cycle=${cycleId}` : `/goals/current`;
  
  const { data, error, isLoading, mutate } = useSWR<GoalFormValues[]>(endpoint, fetcher);

  return {
    goals: data || [],
    isLoading,
    isError: error,
    mutate, // Export mutate to refresh data after creation/edit
  };
}
