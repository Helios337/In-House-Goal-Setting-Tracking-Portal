import { DashboardShell } from "@/components/layout/DashboardShell";
import { UI_ROLES } from "@/lib/roles";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell
      allowedRoles={[UI_ROLES.employee, UI_ROLES.manager, UI_ROLES.admin]}
    >
      {children}
    </DashboardShell>
  );
}
