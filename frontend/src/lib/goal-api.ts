import { api } from "@/lib/api";

export interface GoalSheetSummary {
  id: number;
  cycle_id: number;
  status: string;
  goal_count: number;
  total_weightage: number;
  cycle_name?: string;
}

export interface ApiGoal {
  id: number;
  title: string;
  description?: string;
  weightage: number;
  owner_id: number;
  goal_sheet_id: number;
  uom_type?: string | null;
  target_value?: number | null;
  thrust_area_id?: number | null;
}

export interface GoalSheetDetail extends GoalSheetSummary {
  goals: ApiGoal[];
}

export interface PendingApproval {
  employeeId: string;
  employeeName: string;
  goalSheetId: number;
  status: string;
  goals: ApiGoal[];
}

export interface TeamMemberSummary {
  employee_id: number;
  employee_email: string;
  goal_sheet_id: number;
  sheet_status: string;
}

export interface EmployeeGoalMetric {
  goal_id: number;
  title: string;
  uom_type?: string | null;
  target_value?: number | null;
  actual_value?: number | null;
  progress_score: number;
  quarter?: string | null;
}

export interface EmployeeCheckinContext {
  employee_id: number;
  employee_email: string;
  goal_sheet_id: number;
  sheet_status: string;
  goals: EmployeeGoalMetric[];
}

export interface CascadeOption {
  manager_id: number;
  manager_email: string;
  goals: { id: number; title: string; weightage: number }[];
  subordinates: { id: number; email: string }[];
}

export interface DashboardStats {
  total_users: number;
  active_cycles: number;
  company_average_progress: number;
  reports: {
    user_id: number;
    user_email: string;
    goal_id: number;
    goal_title: string;
    quarter: string;
    progress: number;
  }[];
  team_completion?: {
    department: string;
    totalEmployees: number;
    completedCheckins: number;
  }[];
}

export async function fetchGoalSheets(): Promise<GoalSheetSummary[]> {
  const { data } = await api.get<GoalSheetSummary[]>("/goals/sheets");
  return data;
}

export async function fetchGoalSheet(sheetId: number): Promise<GoalSheetDetail> {
  const { data } = await api.get<GoalSheetDetail>(`/goals/sheets/${sheetId}`);
  return data;
}

export async function fetchCurrentSheet(): Promise<GoalSheetDetail> {
  const { data } = await api.get<GoalSheetDetail>("/goals/sheets/current");
  return data;
}

export async function createGoal(payload: {
  title: string;
  description?: string;
  weightage: number;
  goal_sheet_id: number;
  uom_type?: string;
  target_value?: number;
  thrust_area_id?: number;
}) {
  const { data } = await api.post<ApiGoal>("/goals/", payload);
  return data;
}

export async function submitGoalSheet(sheetId: number) {
  const { data } = await api.post(`/goals/${sheetId}/submit`);
  return data;
}

export async function approveGoalSheet(sheetId: number) {
  const { data } = await api.post(`/goals/${sheetId}/approve`);
  return data;
}

export async function fetchPendingApprovals(): Promise<PendingApproval[]> {
  const { data } = await api.get<PendingApproval[]>("/goals/manager/pending-approvals");
  return data;
}

export async function fetchTeamForCheckin(): Promise<TeamMemberSummary[]> {
  const { data } = await api.get<TeamMemberSummary[]>("/checkins/team");
  return data;
}

export async function fetchEmployeeCheckinData(
  employeeId: number,
  quarter = "Q1"
): Promise<EmployeeCheckinContext> {
  const { data } = await api.get<EmployeeCheckinContext>(
    `/checkins/employee/${employeeId}`,
    { params: { quarter } }
  );
  return data;
}

export async function submitManagerCheckin(payload: {
  goal_sheet_id: number;
  status: string;
  comment_text?: string;
}) {
  const { data } = await api.post("/checkins/", payload);
  return data;
}

export async function fetchCascadeOptions(): Promise<CascadeOption[]> {
  const { data } = await api.get<CascadeOption[]>("/shared-goals/cascade-options");
  return data;
}

export async function adminCascadeKpi(payload: {
  manager_id: number;
  goal_id: number;
  employee_ids: number[];
}) {
  const { data } = await api.post("/shared-goals/admin/cascade", payload);
  return data;
}

export async function logAchievement(payload: {
  goal_id: number;
  quarter: string;
  progress_percentage?: number;
  actual_value?: number;
  narrative?: string;
}) {
  const { data } = await api.post("/achievements/", payload);
  return data;
}

export async function fetchDashboard(): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>("/reports/dashboard");
  return data;
}

export async function downloadReportCsv() {
  const response = await api.get("/reports/export", { responseType: "blob" });
  return response.data;
}
