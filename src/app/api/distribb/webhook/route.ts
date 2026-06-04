import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type DistribbArticle = {
  title?: unknown;
  slug?: unknown;
  content_html?: unknown;
  content_markdown?: unknown;
  meta_description?: unknown;
  image_url?: unknown;
  alt_text?: unknown;
  tags?: unknown;
  author?: unknown;
  status?: unknown;
};

type BlogPostUpsert = {
  title: string;
  slug: string;
  content_html: string;
  content_markdown: string | null;
  meta_description: string | null;
  image_url: string | null;
  alt_text: string | null;
  tags: string[];
  author: string | null;
  status: "Draft" | "Published";
  source: "distribb";
  published_at?: string | null;
};

const MAX_ARTICLES_PER_PAYLOAD = 25;
const MAX_CONTENT_LENGTH = 250_000;

function getExpectedToken() {
  return process.env.DISTRIBB_WEBHOOK_TOKEN?.trim();
}

function cleanString(value: unknown, maxLength = 500) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function cleanOptionalString(value: unknown, maxLength = 1_000) {
  const cleaned = cleanString(value, maxLength);
  return cleaned || null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function getBearerToken(header: string | null) {
  if (!header) return "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? "";
}

function requestHasValidToken(request: NextRequest, expectedToken: string) {
  const authorizationToken = getBearerToken(request.headers.get("authorization"));
  const apiKey = request.headers.get("x-api-key")?.trim() ?? "";
  const makeApiKey = request.headers.get("x-make-apikey")?.trim() ?? "";

  return [authorizationToken, apiKey, makeApiKey].some((token) => token === expectedToken);
}

function normalizeTags(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 20);
}

function normalizeStatus(value: unknown): "Draft" | "Published" {
  return value === "Published" ? "Published" : "Draft";
}

function normalizeArticle(article: DistribbArticle): BlogPostUpsert | null {
  const title = cleanString(article.title, 180);
  const contentHtml = cleanString(article.content_html, MAX_CONTENT_LENGTH);
  const suppliedSlug = cleanString(article.slug, 140);
  const slug = slugify(suppliedSlug || title);
  const status = normalizeStatus(article.status);

  if (!title || !slug || !contentHtml) return null;

  return {
    title,
    slug,
    content_html: contentHtml,
    content_markdown: cleanOptionalString(article.content_markdown, MAX_CONTENT_LENGTH),
    meta_description: cleanOptionalString(article.meta_description, 180),
    image_url: cleanOptionalString(article.image_url, 2_000),
    alt_text: cleanOptionalString(article.alt_text, 250),
    tags: normalizeTags(article.tags),
    author: cleanOptionalString(article.author, 120),
    status,
    source: "distribb",
    published_at: status === "Published" ? new Date().toISOString() : null,
  };
}

export async function POST(request: NextRequest) {
  const expectedToken = getExpectedToken();
  if (!expectedToken) {
    return NextResponse.json({ error: "Distribb webhook token is not configured" }, { status: 503 });
  }

  if (!requestHasValidToken(request, expectedToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const articles = (body as { data?: { articles?: unknown } })?.data?.articles;
  if (!Array.isArray(articles)) {
    return NextResponse.json({ error: "Expected data.articles array" }, { status: 400 });
  }

  const normalized = articles
    .slice(0, MAX_ARTICLES_PER_PAYLOAD)
    .map((article) => normalizeArticle(article as DistribbArticle))
    .filter((article): article is BlogPostUpsert => Boolean(article));

  if (normalized.length === 0) {
    return NextResponse.json({ error: "No valid articles received" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .upsert(normalized, { onConflict: "slug" })
    .select("id, slug, status");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }

  return NextResponse.json({ ok: true, received: normalized.length, articles: data ?? [] });
}
