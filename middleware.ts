import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const username = process.env.PRIVATE_ACCESS_USERNAME?.trim();
const password = process.env.PRIVATE_ACCESS_PASSWORD?.trim();

export function middleware(request: NextRequest) {
  if (!username || !password) {
    return new NextResponse("Private access credentials are not configured.", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const authorization = request.headers.get("authorization");
  const expected = `Basic ${btoa(`${username}:${password}`)}`;

  if (authorization === expected) {
    return NextResponse.next();
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "www-authenticate": 'Basic realm="Private WealthPilot", charset="UTF-8"',
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
