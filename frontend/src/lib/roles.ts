/** Maps UI role keys to backend role names and display labels. */

export const UI_ROLES = {
  employee: "Employee",
  manager: "Manager (L1)",
  admin: "Admin / HR",
} as const;

export type UiRoleKey = keyof typeof UI_ROLES;

/** Demo accounts from seed.py — role is determined by the account, not the login dropdown. */
export const DEMO_LOGIN_BY_ROLE: Record<UiRoleKey, { email: string; label: string }> = {
  employee: { email: "employee@demo.example.com", label: "Employee" },
  manager: { email: "manager@demo.example.com", label: "Manager (L1)" },
  admin: { email: "admin@demo.example.com", label: "Admin / HR" },
};

export function uiRoleToBackend(uiRole: string): string {
  switch (uiRole) {
    case "manager":
      return "MANAGER";
    case "admin":
      return "ADMIN";
    default:
      return "EMPLOYEE";
  }
}

export function backendRoleToUi(backendRole: string): string {
  const normalized = backendRole.toUpperCase();
  if (normalized === "MANAGER") return UI_ROLES.manager;
  if (normalized === "ADMIN") return UI_ROLES.admin;
  return UI_ROLES.employee;
}

export function defaultPathForUiRole(uiRole: string): string {
  switch (uiRole) {
    case "manager":
      return "/manager/dashboard";
    case "admin":
      return "/admin/dashboard";
    default:
      return "/employee/goals";
  }
}

/** Redirect after login using session display role (from backend JWT). */
export function defaultPathForDisplayRole(displayRole: string): string {
  if (displayRole === UI_ROLES.manager) return "/manager/dashboard";
  if (displayRole === UI_ROLES.admin) return "/admin/dashboard";
  return "/employee/goals";
}

/** Landing path from a session role label (e.g. "Manager (L1)"). */
export function defaultPathForSessionRole(roleLabel: string): string {
  if (roleLabel === UI_ROLES.manager) return "/manager/dashboard";
  if (roleLabel === UI_ROLES.admin) return "/admin/dashboard";
  return "/employee/goals";
}
