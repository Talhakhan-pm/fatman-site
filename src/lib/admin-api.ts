export function isAllowedAdminRequest(req: Request, envKey: string) {
  if (process.env.NODE_ENV !== "production") return true;
  const expected = process.env[envKey];
  if (!expected) return false;
  const provided = req.headers.get("x-fatman-admin-key");
  return Boolean(provided && provided === expected);
}
