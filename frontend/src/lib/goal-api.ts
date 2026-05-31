import { api } from "@/lib/api";
import { parseApi } from "@/lib/parse-api";
import {
  apiGoalSchema,
  cascadeOptionSchema,
  cascadeResultSchema,
  dashboardStatsSchema,
  employeeCheckinContextSchema,
  goalSheetDetailSchema,
  goalSheetSummarySchema,
  pendingApprovalSchema,
  teamMemberSummarySchema,
  thrustAreaSchema,
  type ApiGoal,
  type CascadeOption,
  type CascadeResult,
  type DashboardStats,
  type EmployeeCheckinContext,
  type GoalSheetDetail,
  type GoalSheetSummary,
  type PendingApproval,
  type TeamMemberSummary,
  type ThrustArea,
} from "@/lib/api-schemas";
import { z } from "zod";

export type {
  ApiGoal,
  CascadeOption,
  CascadeResult,
  DashboardStats,
  EmployeeCheckinContext,
  EmployeeGoalMetric,
  GoalSheetDetail,
  GoalSheetSummary,
  PendingApproval,
  TeamMemberSummary,
  ThrustArea,
} from "@/lib/api-schemas";

export async function fetchThrustAreas(): Promise<ThrustArea[]> {
  const { data } = await api.get("/thrust-areas");
  return parseApi(z.array(thrustAreaSchema), data, "thrust areas");
}

export async function fetchGoalSheets(): Promise<GoalSheetSummary[]> {
  const { data } = await api.get("/goals/sheets");
  return parseApi(z.array(goalSheetSummarySchema), data, "goal sheets");
}

export async function fetchGoalSheet(sheetId: number): Promise<GoalSheetDetail> {
  const { data } = await api.get(`/goals/sheets/${sheetId}`);
  return parseApi(goalSheetDetailSchema, data, `goal sheet ${sheetId}`);
}

export async function fetchCurrentSheet(): Promise<GoalSheetDetail> {
  const { data } = await api.get("/goals/sheets/current");
  return parseApi(goalSheetDetailSchema, data, "current goal sheet");
}

export async function createGoal(payload: {
  title: string;
  description?: string;
  weightage: number;
  goal_sheet_id: number;
  uom_type?: string;
  target_value?: number;
  thrust_area_id?: number;
}): Promise<ApiGoal> {
  const { data } = await api.post("/goals", payload);
  return parseApi(apiGoalSchema, data, "create goal");
}

export async function submitGoalSheet(sheetId: number): Promise<unknown> {
  const { data } = await api.post(`/goals/${sheetId}/submit`);
  return data;
}

export async function approveGoalSheet(sheetId: number): Promise<unknown> {
  const { data } = await api.post(`/goals/${sheetId}/approve`);
  return data;
}

export async function fetchPendingApprovals(): Promise<PendingApproval[]> {
  const { data } = await api.get("/goals/manager/pending-approvals");
  return parseApi(z.array(pendingApprovalSchema), data, "pending approvals");
}

export async function fetchTeamForCheckin(): Promise<TeamMemberSummary[]> {
  const { data } = await api.get("/checkins/team");
  return parseApi(z.array(teamMemberSummarySchema), data, "checkin team");
}

export async function fetchEmployeeCheckinData(
  employeeId: number,
  quarter = "Q1"
): Promise<EmployeeCheckinContext> {
  const { data } = await api.get(`/checkins/employee/${employeeId}`, {
    params: { quarter },
  });
  return parseApi(employeeCheckinContextSchema, data, `employee checkin ${employeeId}`);
}

export async function submitManagerCheckin(payload: {
  goal_sheet_id: number;
  status: string;
  comment_text?: string;
}): Promise<unknown> {
  const { data } = await api.post("/checkins", payload);
  return data;
}

export async function fetchCascadeOptions(): Promise<CascadeOption[]> {
  const { data } = await api.get("/shared-goals/cascade-options");
  return parseApi(z.array(cascadeOptionSchema), data, "cascade options");
}

export async function adminCascadeKpi(payload: {
  manager_id: number;
  goal_id: number;
  employee_ids: number[];
}): Promise<CascadeResult> {
  const { data } = await api.post("/shared-goals/admin/cascade", payload);
  return parseApi(cascadeResultSchema, data, "admin cascade");
}

export async function logAchievement(payload: {
  goal_id: number;
  quarter: string;
  progress_percentage?: number;
  actual_value?: number;
  narrative?: string;
}): Promise<unknown> {
  const { data } = await api.post("/achievements", payload);
  return data;
}

export async function fetchDashboard(): Promise<DashboardStats> {
  const { data } = await api.get("/reports/dashboard");
  return parseApi(dashboardStatsSchema, data, "dashboard stats");
}

export async function downloadReportCsv(): Promise<Blob> {
  const response = await api.get("/reports/export", { responseType: "blob" });
  if (!(response.data instanceof Blob)) {
    throw new Error("Invalid export response: expected Blob");
  }
  return response.data;
}
