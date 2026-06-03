import { NextResponse } from "next/server";
import { getSessionCookieName, getSessionCookieOptions, normalizeNextPath } from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const next = normalizeNextPath(String(formData.get("next") ?? "/signin"));
  const response = NextResponse.redirect(new URL(next, request.url), { status: 303 });
  response.cookies.set(getSessionCookieName(), "", getSessionCookieOptions(0));
  return response;
}
