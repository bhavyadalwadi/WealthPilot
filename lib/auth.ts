const SESSION_COOKIE_NAME = "wealthpilot_session";

function requiredEnv(name: "PRIVATE_ACCESS_USERNAME" | "PRIVATE_ACCESS_PASSWORD") {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

async function sha256Hex(input: string) {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}

export async function createSessionToken() {
  const username = requiredEnv("PRIVATE_ACCESS_USERNAME");
  const password = requiredEnv("PRIVATE_ACCESS_PASSWORD");
  return sha256Hex(`wealthpilot:${username}:${password}:v1`);
}

export async function isValidLogin(username: string, password: string) {
  return (
    username === requiredEnv("PRIVATE_ACCESS_USERNAME") &&
    password === requiredEnv("PRIVATE_ACCESS_PASSWORD")
  );
}

export async function isValidSessionToken(token?: string) {
  if (!token) return false;
  return token === (await createSessionToken());
}
