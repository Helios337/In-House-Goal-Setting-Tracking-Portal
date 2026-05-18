/** Maps UI role keys to backend role names and display labels. */

export const UI_ROLES = {
  employee: "Employee",
  manager: "Manager (L1)",
  admin: "Admin / HR",
} as const;

export type UiRoleKey = keyof typeof UI_ROLES;

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
