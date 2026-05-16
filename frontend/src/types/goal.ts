export type UoMType = "Min (Numeric / %)" | "Max (Numeric / %)" | "Timeline" | "Zero";

export type GoalStatus = "Not Started" | "On Track" | "Completed";

export type GoalSheetStatus = "Draft" | "Pending Approval" | "Approved (Locked)" | "Returned";

export interface Goal {
  id: string;
  title: string;
  description?: string;
  thrustArea: string;
  uom: UoMType;
  target: string;
  weightage: number;
  isShared: boolean;
  // Check-in specific fields
  actualAchievement?: string;
  progressScore?: number;
  status: GoalStatus;
}

export interface GoalSheet {
  id: string;
  employeeId: string;
  employeeName?: string; // Hydrated by backend for manager views
  cycleId: string;
  status: GoalSheetStatus;
  goals: Goal[];
  totalWeightage: number;
  managerComment?: string;
  submittedAt?: string;
  lockedAt?: string;
}
