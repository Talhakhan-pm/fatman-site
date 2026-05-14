import { createHash, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "fatman_admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

export type AdminSessionScope = "write" | "seed";

function safeEqual(left: string | null | undefined, right: string | null | undefined) {
  if (!left || !right) return false;

  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);

  if (leftBytes.length !== rightBytes.length) return false;

  return timingSafeEqual(leftBytes, rightBytes);
}

function hashSecret(secret: string) {
  return createHash("sha256").update(`fatman-admin-session:${secret}`).digest("hex");
}

function getExpectedSecretForScope(scope: AdminSessionScope) {
  if (scope === "seed") return process.env.FATMAN_ADMIN_SEED_KEY ?? null;
  return process.env.FATMAN_ADMIN_WRITE_KEY ?? null;
}

function parseCookieHeader(cookieHeader: string | null) {
  const cookies = new Map<string, string>();

  if (!cookieHeader) return cookies;

  for (const segment of cookieHeader.split(";")) {
    const trimmed = segment.trim();
    if (!trimmed) continue;

    const separator = trimmed.indexOf("=");
    if (separator <= 0) continue;

    const name = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    if (!name) continue;

    cookies.set(name, decodeURIComponent(value));
  }

  return cookies;
}

export function resolveAdminPasswordScope(password: string): AdminSessionScope | null {
  const trimmed = password.trim();
  if (!trimmed) return null;

  const seedKey = process.env.FATMAN_ADMIN_SEED_KEY ?? null;
  if (safeEqual(trimmed, seedKey)) return "seed";

  const writeKey = process.env.FATMAN_ADMIN_WRITE_KEY ?? null;
  if (safeEqual(trimmed, writeKey)) return "write";

  return null;
}

export function createAdminSessionCookieValue(scope: AdminSessionScope) {
  const secret = getExpectedSecretForScope(scope);
  if (!secret) return null;
  return `${scope}.${hashSecret(secret)}`;
}

export function getAdminSessionScopeFromCookieValue(value: string | null | undefined) {
  if (!value) return null;

  const [scope, digest] = value.split(".", 2);
  if ((scope !== "write" && scope !== "seed") || !digest) return null;

  const expectedSecret = getExpectedSecretForScope(scope);
  if (!expectedSecret) return null;

  const expectedValue = `${scope}.${hashSecret(expectedSecret)}`;
  return safeEqual(value, expectedValue) ? (scope as AdminSessionScope) : null;
}

export function getAdminSessionScopeFromRequest(req: Request) {
  const cookies = parseCookieHeader(req.headers.get("cookie"));
  return getAdminSessionScopeFromCookieValue(cookies.get(ADMIN_SESSION_COOKIE));
}

export function allowsAdminScope(scope: AdminSessionScope | null, envKey: string) {
  if (!scope) return false;
  if (scope === "seed") return true;
  return envKey === "FATMAN_ADMIN_WRITE_KEY";
}
