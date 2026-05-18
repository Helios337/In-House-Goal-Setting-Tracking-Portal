import useSWR from "swr";
import type { AxiosResponse } from "axios";
import { api } from "@/lib/api";

interface TeamMemberGoals {
  employeeId: string;
  employeeName: string;
  status: "Draft" | "Pending Approval" | "Locked";
  goals: any[];
}

const fetcher = (url: string) => api.get(url).then((res: AxiosResponse) => res.data);

export function useTeamGoals(managerId?: string) {
  // If managerId is not passed, backend infers it from the NextAuth token
  const endpoint = managerId ? `/team-goals?managerId=${managerId}` : `/team-goals`;

  const { data, error, isLoading, mutate } = useSWR<TeamMemberGoals[]>(endpoint, fetcher, {
    refreshInterval: 30000,
  });

  return {
    teamData: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
