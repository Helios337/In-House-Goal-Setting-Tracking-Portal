import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { UI_ROLES } from "@/lib/roles";

function hasAnyRole(roles: string[], allowed: string[]): boolean {
  return roles.some((role) => allowed.includes(role));
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const roles = (token?.roles as string[] | undefined) ?? [];
    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin") && !hasAnyRole(roles, [UI_ROLES.admin])) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (
      path.startsWith("/manager") &&
      !hasAnyRole(roles, [UI_ROLES.manager, UI_ROLES.admin])
    ) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (path.startsWith("/employee") && !hasAnyRole(roles, [UI_ROLES.employee])) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/login",
    },
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/employee/:path*", "/manager/:path*", "/admin/:path*"],
};
