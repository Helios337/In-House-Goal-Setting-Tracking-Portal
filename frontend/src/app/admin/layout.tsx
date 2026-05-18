import { DashboardShell } from "@/components/layout/DashboardShell";
import { UI_ROLES } from "@/lib/roles";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell allowedRoles={[UI_ROLES.admin]}>
      {children}
    </DashboardShell>
  );
}
