"use client";

import useSWR from "swr";
import { useSession } from "next-auth/react";
import { z } from "zod";
import { createValidatedFetcher } from "@/lib/swr-fetcher";
import {
  cascadeOptionSchema,
  cycleSchema,
  dashboardStatsSchema,
  employeeCheckinContextSchema,
  goalSheetDetailSchema,
  goalSheetSummarySchema,
  pendingApprovalSchema,
  teamMemberSummarySchema,
  thrustAreaSchema,
} from "@/lib/api-schemas";

const fetchGoalSheets = createValidatedFetcher(
  z.array(goalSheetSummarySchema),
  "goal sheets"
);
const fetchCurrentSheet = createValidatedFetcher(goalSheetDetailSchema, "current goal sheet");
const fetchGoalSheet = createValidatedFetcher(goalSheetDetailSchema, "goal sheet");
const fetchThrustAreas = createValidatedFetcher(z.array(thrustAreaSchema), "thrust areas");
const fetchPendingApprovals = createValidatedFetcher(
  z.array(pendingApprovalSchema),
  "pending approvals"
);
const fetchTeamForCheckin = createValidatedFetcher(
  z.array(teamMemberSummarySchema),
  "checkin team"
);
const fetchEmployeeCheckin = createValidatedFetcher(
  employeeCheckinContextSchema,
  "employee checkin"
);
const fetchDashboard = createValidatedFetcher(dashboardStatsSchema, "dashboard stats");
const fetchCascadeOptions = createValidatedFetcher(
  z.array(cascadeOptionSchema),
  "cascade options"
);
const fetchCycles = createValidatedFetcher(z.array(cycleSchema), "cycles");

function useAuthKey(key: string | null): string | null {
  const { status } = useSession();
  if (status !== "authenticated") return null;
  return key;
}

export function useGoalSheets() {
  const swrKey = useAuthKey("/goals/sheets");
  const { data, error, isLoading, mutate } = useSWR(swrKey, fetchGoalSheets);
  return { goalSheets: data ?? [], isLoading, isError: error, mutate };
}

export function useCurrentSheet(enabled = true) {
  const swrKey = useAuthKey(enabled ? "/goals/sheets/current" : null);
  const { data, error, isLoading, mutate } = useSWR(swrKey, fetchCurrentSheet);
  return { currentSheet: data, isLoading, isError: error, mutate };
}

export function useGoalSheet(sheetId: number | null) {
  const key =
    sheetId && !Number.isNaN(sheetId) ? `/goals/sheets/${sheetId}` : null;
  const swrKey = useAuthKey(key);
  const { data, error, isLoading, mutate } = useSWR(swrKey, fetchGoalSheet);
  return { sheet: data, isLoading, isError: error, mutate };
}

export function useThrustAreas(enabled = true) {
  const swrKey = useAuthKey(enabled ? "/thrust-areas" : null);
  const { data, error, isLoading, mutate } = useSWR(swrKey, fetchThrustAreas);
  return { thrustAreas: data ?? [], isLoading, isError: error, mutate };
}

export function usePendingApprovals() {
  const swrKey = useAuthKey("/goals/manager/pending-approvals");
  const { data, error, isLoading, mutate } = useSWR(swrKey, fetchPendingApprovals, {
    refreshInterval: 30000,
  });
  return { pendingApprovals: data ?? [], isLoading, isError: error, mutate };
}

export function useTeamForCheckin() {
  const swrKey = useAuthKey("/checkins/team");
  const { data, error, isLoading, mutate } = useSWR(swrKey, fetchTeamForCheckin, {
    refreshInterval: 30000,
  });
  return { checkinTeam: data ?? [], isLoading, isError: error, mutate };
}

export function useEmployeeCheckin(employeeId: number | null, quarter = "Q1") {
  const key =
    employeeId && !Number.isNaN(employeeId)
      ? `/checkins/employee/${employeeId}?quarter=${quarter}`
      : null;
  const swrKey = useAuthKey(key);
  const { data, error, isLoading, mutate } = useSWR(swrKey, fetchEmployeeCheckin);
  return { checkinData: data, isLoading, isError: error, mutate };
}

export function useDashboardStats() {
  const swrKey = useAuthKey("/reports/dashboard");
  const { data, error, isLoading, mutate } = useSWR(swrKey, fetchDashboard);
  return { stats: data, isLoading, isError: error, mutate };
}

export function useCascadeOptions() {
  const swrKey = useAuthKey("/shared-goals/cascade-options");
  const { data, error, isLoading, mutate } = useSWR(swrKey, fetchCascadeOptions);
  return { options: data ?? [], isLoading, isError: error, mutate };
}

export function useCycles(enabled = true) {
  const swrKey = useAuthKey(enabled ? "/cycles" : null);
  const { data, error, isLoading, mutate } = useSWR(swrKey, fetchCycles);
  return { cycles: data ?? [], isLoading, isError: error, mutate };
}
