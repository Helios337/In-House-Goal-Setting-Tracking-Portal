import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export { authOptions };

export const getAuthSession = () => getServerSession(authOptions);

export const getCurrentUser = async () => {
  const session = await getAuthSession();
  return session?.user;
};

/** Server-side role gate — redirects instead of throwing. */
export async function enforceRole(allowedRoles: string[]) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const roles = user.roles ?? [];
  const hasAccess = roles.some((role) => allowedRoles.includes(role));

  if (!hasAccess) {
    redirect("/unauthorized");
  }

  return user;
}

/** Throws for use in API routes or server actions that need explicit error handling. */
export const requireRole = async (allowedRoles: string[]) => {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const roles = user.roles ?? [];
  const hasAccess = roles.some((role) => allowedRoles.includes(role));

  if (!hasAccess) {
    throw new Error("Forbidden: Insufficient permissions");
  }

  return user;
};
