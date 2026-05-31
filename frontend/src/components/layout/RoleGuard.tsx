"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [authorized, setAuthorized] = React.useState(false);

  React.useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    const userRoles = session?.user?.roles ?? ["Employee"];
    const hasAccess = userRoles.some((role: string) => allowedRoles.includes(role));

    if (!hasAccess) {
      router.push("/unauthorized");
      return;
    }

    setAuthorized(true);
  }, [session, status, allowedRoles, router]);

  if (status === "loading" || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  return <>{children}</>;
}
