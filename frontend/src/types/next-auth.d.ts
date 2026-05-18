import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      accessToken?: string;
      roles?: string[];
      managerId?: string | null;
    };
  }

  interface User {
    accessToken?: string;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    backendUserId?: string;
    roles?: string[];
    managerId?: string | null;
  }
}
