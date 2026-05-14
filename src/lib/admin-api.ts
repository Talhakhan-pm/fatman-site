import { allowsAdminScope, getAdminSessionScopeFromRequest } from "@/lib/admin-session";

export function isAllowedAdminRequest(req: Request, envKey: string) {
  if (process.env.NODE_ENV !== "production") return true;

  const expected = process.env[envKey];
  const provided = req.headers.get("x-fatman-admin-key");
  if (expected && provided === expected) return true;

  const sessionScope = getAdminSessionScopeFromRequest(req);
  return allowsAdminScope(sessionScope, envKey);
}
