import { z } from "zod";

export const backendTokenSchema = z.object({
  access_token: z.string(),
  user_id: z.number(),
  role: z.string().optional(),
  email: z.string().optional(),
});

export const thrustAreaSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const apiGoalSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().optional(),
  weightage: z.number(),
  owner_id: z.number(),
  goal_sheet_id: z.number(),
  uom_type: z.string().nullable().optional(),
  target_value: z.number().nullable().optional(),
  thrust_area_id: z.number().nullable().optional(),
});

export const goalSheetSummarySchema = z.object({
  id: z.number(),
  cycle_id: z.number(),
  status: z.string(),
  goal_count: z.number(),
  total_weightage: z.number(),
  cycle_name: z.string().optional(),
});

export const goalSheetDetailSchema = goalSheetSummarySchema.extend({
  goals: z.array(apiGoalSchema),
});

export const pendingApprovalSchema = z.object({
  employeeId: z.string(),
  employeeName: z.string(),
  goalSheetId: z.number(),
  status: z.string(),
  goals: z.array(apiGoalSchema),
});

export const teamMemberSummarySchema = z.object({
  employee_id: z.number(),
  employee_email: z.string(),
  goal_sheet_id: z.number(),
  sheet_status: z.string(),
});

export const employeeGoalMetricSchema = z.object({
  goal_id: z.number(),
  title: z.string(),
  uom_type: z.string().nullable().optional(),
  target_value: z.number().nullable().optional(),
  actual_value: z.number().nullable().optional(),
  progress_score: z.number(),
  quarter: z.string().nullable().optional(),
});

export const employeeCheckinContextSchema = z.object({
  employee_id: z.number(),
  employee_email: z.string(),
  goal_sheet_id: z.number(),
  sheet_status: z.string(),
  goals: z.array(employeeGoalMetricSchema),
});

export const cascadeOptionSchema = z.object({
  manager_id: z.number(),
  manager_email: z.string(),
  goals: z.array(
    z.object({
      id: z.number(),
      title: z.string(),
      weightage: z.number(),
    })
  ),
  subordinates: z.array(
    z.object({
      id: z.number(),
      email: z.string(),
    })
  ),
});

export const cascadeResultSchema = z.object({
  pushed: z
    .array(
      z.object({
        employee_id: z.number(),
        shared_goal_id: z.number(),
      })
    )
    .optional(),
  skipped: z
    .array(
      z.object({
        employee_id: z.number(),
        reason: z.string(),
      })
    )
    .optional(),
});

export const dashboardStatsSchema = z.object({
  total_users: z.number(),
  active_cycles: z.number(),
  company_average_progress: z.number(),
  reports: z.array(
    z.object({
      user_id: z.number(),
      user_email: z.string(),
      goal_id: z.number(),
      goal_title: z.string(),
      quarter: z.string(),
      progress: z.number(),
    })
  ),
  team_completion: z
    .array(
      z.object({
        department: z.string(),
        totalEmployees: z.number(),
        completedCheckins: z.number(),
      })
    )
    .optional(),
});

export const cycleSchema = z.object({
  id: z.number(),
  name: z.string(),
  start_date: z.string(),
  end_date: z.string(),
});

export const notificationItemSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  type: z.string(),
  title: z.string(),
  body: z.string().optional(),
  resource_type: z.string().optional(),
  resource_id: z.number().optional(),
  read_at: z.string().nullable().optional(),
  delivery_status: z.string(),
  created_at: z.string(),
});

export const notificationListSchema = z.object({
  notifications: z.array(notificationItemSchema),
  unread_count: z.number(),
});

export const auditLogEntrySchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  action: z.string(),
  performedBy: z.string(),
  details: z.string(),
});

export const auditLogPageSchema = z.object({
  logs: z.array(auditLogEntrySchema),
  totalPages: z.number(),
});

export const domainEventSchema = z.object({
  type: z.string(),
  actor_id: z.number().optional(),
  resource_type: z.string().optional(),
  resource_id: z.number().optional(),
  payload: z.record(z.unknown()).optional(),
  timestamp: z.string().optional(),
});

export type ThrustArea = z.infer<typeof thrustAreaSchema>;
export type ApiGoal = z.infer<typeof apiGoalSchema>;
export type GoalSheetSummary = z.infer<typeof goalSheetSummarySchema>;
export type GoalSheetDetail = z.infer<typeof goalSheetDetailSchema>;
export type PendingApproval = z.infer<typeof pendingApprovalSchema>;
export type TeamMemberSummary = z.infer<typeof teamMemberSummarySchema>;
export type EmployeeGoalMetric = z.infer<typeof employeeGoalMetricSchema>;
export type EmployeeCheckinContext = z.infer<typeof employeeCheckinContextSchema>;
export type CascadeOption = z.infer<typeof cascadeOptionSchema>;
export type CascadeResult = z.infer<typeof cascadeResultSchema>;
export type DashboardStats = z.infer<typeof dashboardStatsSchema>;
export type Cycle = z.infer<typeof cycleSchema>;
export type NotificationItem = z.infer<typeof notificationItemSchema>;
export type NotificationListResponse = z.infer<typeof notificationListSchema>;
export type AuditLogEntry = z.infer<typeof auditLogEntrySchema>;
export type DomainEventMessage = z.infer<typeof domainEventSchema>;
