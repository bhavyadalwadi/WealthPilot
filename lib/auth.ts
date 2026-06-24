const SESSION_COOKIE_NAME = "wealthpilot_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const SESSION_VERSION = "v1";
const PRIVATE_ACCESS_ENV_NAMES = [
  "PRIVATE_ACCESS_USERNAME",
  "PRIVATE_ACCESS_PASSWORD",
  "SESSION_SECRET",
] as const;

type PrivateAccessEnvName = (typeof PRIVATE_ACCESS_ENV_NAMES)[number];

function requiredEnv(name: PrivateAccessEnvName) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

function timingSafeEqualString(a: string, b: string) {
  if (a.length !== b.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return mismatch === 0;
}

async function sha256Hex(input: string) {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function getSessionSignature(expiresAt: number) {
  const sessionSecret = requiredEnv("SESSION_SECRET");
  return sha256Hex(`wealthpilot:${SESSION_VERSION}:${expiresAt}:${sessionSecret}`);
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}

export function getSessionMaxAgeSeconds() {
  return SESSION_MAX_AGE_SECONDS;
}

export function getSessionCookieOptions(maxAge = SESSION_MAX_AGE_SECONDS) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export function getPrivateAccessConfig() {
  return {
    username: requiredEnv("PRIVATE_ACCESS_USERNAME"),
    password: requiredEnv("PRIVATE_ACCESS_PASSWORD"),
  };
}

export function hasConfiguredAuth() {
  return Boolean(
    process.env.PRIVATE_ACCESS_USERNAME &&
      process.env.PRIVATE_ACCESS_PASSWORD &&
      process.env.SESSION_SECRET,
  );
}

export function normalizeNextPath(next: string | null | undefined) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }
  return next;
}

export async function createSessionToken() {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const signature = await getSessionSignature(expiresAt);
  return `${SESSION_VERSION}.${expiresAt}.${signature}`;
}

export async function isValidLogin(username: string, password: string) {
  const config = getPrivateAccessConfig();
  return (
    timingSafeEqualString(username, config.username) &&
    timingSafeEqualString(password, config.password)
  );
}

export async function isValidSessionToken(token?: string) {
  if (!token) {
    return false;
  }

  const [version, expiresAtRaw, signature] = token.split(".");
  if (!version || !expiresAtRaw || !signature || version !== SESSION_VERSION) {
    return false;
  }

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    return false;
  }

  const expectedSignature = await getSessionSignature(expiresAt);
  return timingSafeEqualString(signature, expectedSignature);
}
