/** Resolve the backend JWT for both browser (NextAuth client) and server (RSC / route handlers). */
export async function getAccessToken(): Promise<string | undefined> {
  if (typeof window !== "undefined") {
    const { getSession } = await import("next-auth/react");
    const session = await getSession();
    return session?.user?.accessToken;
  }

  const { getServerSession } = await import("next-auth");
  const { authOptions } = await import("@/lib/auth-options");
  const session = await getServerSession(authOptions);
  return session?.user?.accessToken;
}
