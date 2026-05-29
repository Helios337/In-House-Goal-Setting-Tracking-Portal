import type { Account, Profile, Session, User } from "next-auth";
import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import { backendRoleToUi } from "@/lib/roles";

interface BackendTokenResponse {
  access_token: string;
  user_id: number;
  role?: string;
  email?: string;
}

function apiBaseUrl(): string {
  return (
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000"
  );
}

async function loginWithPassword(
  email: string,
  password: string
): Promise<BackendTokenResponse | null> {
  const body = new URLSearchParams();
  body.set("username", email);
  body.set("password", password);

  const response = await fetch(`${apiBaseUrl()}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    return null;
  }
  return response.json();
}

async function exchangeSsoToken(
  email: string,
  name?: string | null,
  idToken?: string | null
): Promise<BackendTokenResponse | null> {
  const response = await fetch(`${apiBaseUrl()}/api/v1/auth/sso`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      name,
      role_name: "EMPLOYEE",
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
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const tokenData = await loginWithPassword(
          credentials.email,
          credentials.password
        );
        if (!tokenData) return null;
        const role = backendRoleToUi(tokenData.role || "EMPLOYEE");
        return {
          id: String(tokenData.user_id),
          email: tokenData.email || credentials.email,
          name: (tokenData.email || credentials.email).split("@")[0],
          accessToken: tokenData.access_token,
          role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({
      token,
      account,
      profile,
      user,
    }: {
      token: JWT;
      account?: Account | null;
      profile?: Profile;
      user?: User;
    }) {
      if (account?.provider === "credentials" && user) {
        token.accessToken = user.accessToken;
        token.backendUserId = user.id;
        token.roles = [user.role || "Employee"];
        return token;
      }

      if (account?.provider === "azure-ad" && profile?.email) {
        const tokenData = await exchangeSsoToken(
          profile.email,
          profile.name,
          account.id_token
        );
        if (tokenData) {
          token.accessToken = tokenData.access_token;
          token.backendUserId = String(tokenData.user_id);
          token.roles = [backendRoleToUi(tokenData.role || "EMPLOYEE")];
        }
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }) {
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
