import { DashboardShell } from "@/components/layout/DashboardShell";
import { enforceRole } from "@/lib/auth";
import { UI_ROLES } from "@/lib/roles";

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await enforceRole([UI_ROLES.employee]);

  return (
    <DashboardShell allowedRoles={[UI_ROLES.employee]}>
      {children}
    </DashboardShell>
  );
}
