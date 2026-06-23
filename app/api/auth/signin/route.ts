import { NextResponse } from "next/server";
import {
  createSessionToken,
  hasConfiguredAuth,
  getSessionCookieName,
  getSessionCookieOptions,
  isValidLogin,
  normalizeNextPath,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const next = normalizeNextPath(String(formData.get("next") ?? ""));

    if (!hasConfiguredAuth()) {
      const signInUrl = new URL("/signin", request.url);
      signInUrl.searchParams.set("next", next);
      signInUrl.searchParams.set("error", "config");
      return NextResponse.redirect(signInUrl, { status: 303 });
    }

    if (!(await isValidLogin(username, password))) {
      const signInUrl = new URL("/signin", request.url);
      signInUrl.searchParams.set("next", next);
      signInUrl.searchParams.set("error", "invalid");
      return NextResponse.redirect(signInUrl, { status: 303 });
    }

    const response = NextResponse.redirect(new URL(next, request.url), { status: 303 });
    response.cookies.set(getSessionCookieName(), await createSessionToken(), getSessionCookieOptions());

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sign-in failed.";
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("error", "server");
    return NextResponse.redirect(
      new URL(`${signInUrl.pathname}?${signInUrl.searchParams.toString()}`, request.url),
      {
        status: 303,
        headers: {
          "x-auth-error": message,
        },
      },
    );
  }
}
