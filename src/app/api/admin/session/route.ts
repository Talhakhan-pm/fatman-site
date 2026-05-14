import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionCookieValue,
  getAdminSessionScopeFromRequest,
  resolveAdminPasswordScope,
} from "@/lib/admin-session";

function clearAdminSession() {
  const response = NextResponse.json({ ok: true, authenticated: false });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export async function GET(req: Request) {
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.json({ ok: true, authenticated: true, scope: "write", mode: "development" });
  }

  const scope = getAdminSessionScopeFromRequest(req);
  return NextResponse.json({
    ok: true,
    authenticated: Boolean(scope),
    scope,
    mode: "production",
  });
}

export async function POST(req: Request) {
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.json({ ok: true, authenticated: true, scope: "write", mode: "development" });
  }

  const body = (await req.json().catch(() => null)) as { password?: string } | null;
  const password = typeof body?.password === "string" ? body.password : "";
  const scope = resolveAdminPasswordScope(password);

  if (!scope) {
    return NextResponse.json({ error: "Invalid admin password" }, { status: 403 });
  }

  const cookieValue = createAdminSessionCookieValue(scope);
  if (!cookieValue) {
    return NextResponse.json({ error: "Admin session is not configured" }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true, authenticated: true, scope });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: cookieValue,
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });

  return response;
}

export async function DELETE() {
  return clearAdminSession();
}
