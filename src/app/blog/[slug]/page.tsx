import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedBlogPost } from "@/lib/blog-db";

const SITE_URL = "https://fatmanparts.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPost(slug);

  if (!post) {
    return {
      title: "Blog Post Not Found | Fatman Parts",
      description: "The requested Fatman Garage blog post could not be found.",
    };
  }

  return {
    title: `${post.title} | Fatman Garage`,
    description: post.metaDescription ?? "Fatman Parts garage guide.",
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: `${post.title} | Fatman Garage`,
      description: post.metaDescription ?? undefined,
      url: `${SITE_URL}/blog/${post.slug}`,
      type: "article",
      images: post.imageUrl
        ? [
            {
              url: post.imageUrl,
              alt: post.altText ?? post.title,
            },
          ]
        : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedBlogPost(slug);

  if (!post) notFound();

  const publishedDate = post.publishedAt ?? post.updatedAt;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.metaDescription,
    "image": post.imageUrl ? [post.imageUrl] : undefined,
    "datePublished": publishedDate,
    "dateModified": post.updatedAt,
    "author": {
      "@type": "Person",
      "name": post.author ?? "Fatman Parts",
    },
    "publisher": {
      "@type": "Organization",
      "name": "Fatman Parts",
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/brand/fatman-fp-shield.png`,
      },
    },
    "mainEntityOfPage": `${SITE_URL}/blog/${post.slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <main className="min-h-screen bg-fatman-900 text-white">
        <article className="mx-auto max-w-3xl px-6 py-10">
          <Link href="/blog" className="text-sm font-semibold text-fatman-300 hover:text-fatman-200">
            ← Fatman Garage Blog
          </Link>

          <header className="mt-6">
            <div className="mb-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/70">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-3xl font-black leading-tight md:text-5xl">{post.title}</h1>
            <p className="mt-4 text-white/65">
              {post.author ?? "Fatman Parts"} · {new Date(publishedDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            {post.metaDescription ? <p className="mt-4 text-lg text-white/75">{post.metaDescription}</p> : null}
          </header>

          {post.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.imageUrl}
              alt={post.altText ?? post.title}
              className="mt-8 max-h-[420px] w-full rounded-2xl border border-white/10 object-cover"
            />
          ) : null}

          <div
            className="prose prose-invert mt-8 max-w-none prose-headings:text-white prose-a:text-fatman-300 prose-strong:text-white prose-li:marker:text-fatman-300"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />
        </article>
      </main>
    </>
  );
}
