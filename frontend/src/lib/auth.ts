import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export { authOptions };

export const getAuthSession = () => getServerSession(authOptions);

export const getCurrentUser = async () => {
  const session = await getAuthSession();
  return session?.user;
};

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
