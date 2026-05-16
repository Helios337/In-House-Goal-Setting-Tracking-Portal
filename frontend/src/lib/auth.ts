import { getServerSession, type NextAuthOptions, type DefaultSession } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

/**
 * 1. TypeScript Module Augmentation
 * Extends the default NextAuth session and JWT types to include custom properties
 * required by the HR portal (roles, manager hierarchy, and tokens).
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      roles: string[];
      managerId: string | null;
      accessToken?: string;
    } & DefaultSession["user"];
  }

  interface User {
    roles?: string[];
    managerId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    roles: string[];
    managerId: string | null;
    accessToken?: string;
  }
}

/**
 * 2. NextAuth Configuration Object
 * Centralized here so it can be used by both the API Route Handler and Server Components.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID || "",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || "",
      tenantId: process.env.AZURE_AD_TENANT_ID,
      authorization: {
        params: {
          // Request extended scopes to sync Org Hierarchy and Roles from Azure AD
          scope: "openid profile email User.Read User.Read.All Directory.Read.All",
        },
      },
      profile(profile) {
        // Map Entra ID / Azure AD profile attributes to our custom User object
        return {
          id: profile.oid,
          name: profile.name,
          email: profile.preferred_username,
          image: null,
          // Fallback to "Employee" if roles are not configured in Azure AD yet
          roles: profile.roles && profile.roles.length > 0 ? profile.roles : ["Employee"],
          managerId: profile.manager || null, 
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      // Initial sign-in: map user properties to the JWT token
      if (account && user) {
        token.id = user.id;
        token.accessToken = account.access_token;
        token.roles = user.roles || ["Employee"];
        token.managerId = user.managerId || null;
      }
      return token;
    },
    async session({ session, token }) {
      // Attach the custom properties from the JWT token to the client-facing Session object
      if (session.user) {
        session.user.id = token.id;
        session.user.roles = token.roles;
        session.user.managerId = token.managerId;
        session.user.accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",       // Custom login page overriding the default NextAuth UI
    error: "/auth/error",   // Custom error boundary page
  },
  session: {
    strategy: "jwt",
    maxAge: 4 * 60 * 60, // 4-hour session limit matching standard enterprise security policies
  },
};

/**
 * 3. Server-Side Session Helpers
 * Use these inside Next.js 14 Server Components and Route Handlers to securely
 * access the current user's data without needing to pass `authOptions` every time.
 */

// Fetches the full session object
export const getAuthSession = () => getServerSession(authOptions);

// Quick helper to get just the user object
export const getCurrentUser = async () => {
  const session = await getAuthSession();
  return session?.user;
};

// Helper to strictly enforce role access in Server Actions / API Routes
export const requireRole = async (allowedRoles: string[]) => {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("Unauthorized");
  }

  const hasAccess = user.roles.some((role) => allowedRoles.includes(role));
  
  if (!hasAccess) {
    throw new Error("Forbidden: Insufficient permissions");
  }

  return user;
};
