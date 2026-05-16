import NextAuth, { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID || "",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || "",
      tenantId: process.env.AZURE_AD_TENANT_ID,
      // Requesting additional directory schema fields for Org Hierarchy Sync
      authorization: {
        params: {
          scope: "openid profile email User.Read User.Read.All",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }: any) {
      // Logic extracted from HR systems: Map Directory Extensions & Roles
      if (account && profile) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        
        // Extract roles mapped from Azure AD Groups
        token.roles = profile.roles || ["Employee"]; 
        
        // Extract manager details if available in the profile attributes
        token.managerId = profile.manager || null;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.accessToken = token.accessToken;
        session.user.roles = token.roles;
        session.user.managerId = token.managerId;
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
    maxAge: 4 * 60 * 60, // 4 hours session matching enterprise window limits
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
