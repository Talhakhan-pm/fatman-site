import { NextResponse } from "next/server";
import { submitToIndexNow } from "@/lib/indexnow";

/**
 * Ping endpoint for the catalog pipeline: POST the URLs that changed and
 * Bing is told immediately. Guarded by INDEXNOW_SECRET so the endpoint
 * can't be used to submit arbitrary URLs on our behalf; if the env var is
 * unset the route refuses rather than running open.
 */
export async function POST(request: Request) {
  const secret = process.env.INDEXNOW_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "INDEXNOW_SECRET is not configured" }, { status: 503 });
  }
  if (request.headers.get("x-indexnow-secret") !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { urls?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const urls = Array.isArray(body.urls) ? body.urls.filter((u): u is string => typeof u === "string") : [];
  if (urls.length === 0) {
    return NextResponse.json({ error: "body must be { urls: string[] }" }, { status: 400 });
  }

  const result = await submitToIndexNow(urls);
  return NextResponse.json(result);
}
