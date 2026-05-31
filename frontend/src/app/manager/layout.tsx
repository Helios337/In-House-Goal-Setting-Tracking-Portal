import { DashboardShell } from "@/components/layout/DashboardShell";
import { enforceRole } from "@/lib/auth";
import { UI_ROLES } from "@/lib/roles";

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await enforceRole([UI_ROLES.manager, UI_ROLES.admin]);

  return (
    <DashboardShell allowedRoles={[UI_ROLES.manager, UI_ROLES.admin]}>
      {children}
    </DashboardShell>
  );
}
