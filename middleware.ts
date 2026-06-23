import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  hasConfiguredAuth,
  getSessionCookieName,
  isValidSessionToken,
  normalizeNextPath,
} from "@/lib/auth";

function isPublicPath(pathname: string) {
  return pathname === "/signin" || pathname.startsWith("/api/auth/signin");
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasAuth = hasConfiguredAuth();
  const isAuthed = hasAuth
    ? await isValidSessionToken(
        request.cookies.get(getSessionCookieName())?.value,
      )
    : false;

  if (isPublicPath(pathname)) {
    if (pathname === "/signin" && hasAuth && isAuthed) {
      const destination = normalizeNextPath(request.nextUrl.searchParams.get("next"));
      return NextResponse.redirect(new URL(destination, request.url));
    }

    return NextResponse.next();
  }

  if (!hasAuth) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("next", normalizeNextPath(`${pathname}${search}`));
    signInUrl.searchParams.set("error", "config");
    return NextResponse.redirect(signInUrl, { status: 303 });
  }

  if (!isAuthed) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("next", normalizeNextPath(`${pathname}${search}`));
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
