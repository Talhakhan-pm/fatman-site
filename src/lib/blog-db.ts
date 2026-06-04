import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type BlogPostStatus = "Draft" | "Published";

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  contentHtml: string;
  contentMarkdown: string | null;
  metaDescription: string | null;
  imageUrl: string | null;
  altText: string | null;
  tags: string[];
  author: string | null;
  status: BlogPostStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type BlogPostRow = {
  id: string;
  title: string;
  slug: string;
  content_html: string;
  content_markdown: string | null;
  meta_description: string | null;
  image_url: string | null;
  alt_text: string | null;
  tags: string[] | null;
  author: string | null;
  status: BlogPostStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

function mapBlogPost(row: BlogPostRow): BlogPost {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    contentHtml: row.content_html,
    contentMarkdown: row.content_markdown,
    metaDescription: row.meta_description,
    imageUrl: row.image_url,
    altText: row.alt_text,
    tags: Array.isArray(row.tags) ? row.tags : [],
    author: row.author,
    status: row.status,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const BLOG_SELECT = `
  id,
  title,
  slug,
  content_html,
  content_markdown,
  meta_description,
  image_url,
  alt_text,
  tags,
  author,
  status,
  published_at,
  created_at,
  updated_at
`;

export async function getPublishedBlogPosts(limit = 50): Promise<BlogPost[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(BLOG_SELECT)
    .eq("status", "Published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return (data as BlogPostRow[]).map(mapBlogPost);
}

export async function getPublishedBlogPost(slug: string): Promise<BlogPost | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(BLOG_SELECT)
    .eq("slug", slug)
    .eq("status", "Published")
    .maybeSingle();

  if (error || !data) return null;
  return mapBlogPost(data as BlogPostRow);
}
