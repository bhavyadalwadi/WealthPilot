import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  getPrivateAccessConfig,
  getSessionCookieName,
  isValidSessionToken,
  normalizeNextPath,
} from "@/lib/auth";

function isPublicPath(pathname: string) {
  return pathname === "/signin" || pathname.startsWith("/api/auth/signin");
}

export async function middleware(request: NextRequest) {
  try {
    getPrivateAccessConfig();
  } catch {
    return new NextResponse("Missing PRIVATE_ACCESS_USERNAME or PRIVATE_ACCESS_PASSWORD", {
      status: 500,
      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  }

  const { pathname, search } = request.nextUrl;
  const isAuthed = await isValidSessionToken(
    request.cookies.get(getSessionCookieName())?.value,
  );

  if (isPublicPath(pathname)) {
    if (pathname === "/signin" && isAuthed) {
      const destination = normalizeNextPath(request.nextUrl.searchParams.get("next"));
      return NextResponse.redirect(new URL(destination, request.url));
    }

    return NextResponse.next();
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
