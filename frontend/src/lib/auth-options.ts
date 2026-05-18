import type { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import { backendRoleToUi, uiRoleToBackend } from "@/lib/roles";

async function exchangeBackendToken(
  email: string,
  roleName?: string,
  name?: string | null,
  idToken?: string | null
) {
  const apiUrl =
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000";

  const response = await fetch(`${apiUrl}/api/v1/auth/sso`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      name,
      role_name: roleName || "EMPLOYEE",
      id_token: idToken || undefined,
    }),
  });

  if (!response.ok) {
    return null;
  }
  return response.json();
}

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID || "",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || "",
      tenantId: process.env.AZURE_AD_TENANT_ID,
      authorization: {
        params: {
          scope: "openid profile email User.Read",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const backendRole = uiRoleToBackend(credentials.role || "employee");
        const tokenData = await exchangeBackendToken(
          credentials.email,
          backendRole
        );
        if (!tokenData) return null;
        return {
          id: String(tokenData.user_id),
          email: credentials.email,
          name: credentials.email.split("@")[0],
          accessToken: tokenData.access_token,
          role: backendRoleToUi(tokenData.role || backendRole),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile, user }: any) {
      if (account?.provider === "credentials" && user) {
        token.accessToken = user.accessToken;
        token.backendUserId = user.id;
        token.roles = [user.role];
        return token;
      }

      if (account?.provider === "azure-ad" && profile?.email) {
        const tokenData = await exchangeBackendToken(
          profile.email,
          "EMPLOYEE",
          profile.name,
          account.id_token
        );
        if (tokenData) {
          token.accessToken = tokenData.access_token;
          token.backendUserId = tokenData.user_id;
          token.roles = [backendRoleToUi(tokenData.role || "EMPLOYEE")];
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.backendUserId || token.sub;
        session.user.accessToken = token.accessToken;
        session.user.roles = token.roles || ["Employee"];
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 4 * 60 * 60,
  },
};
