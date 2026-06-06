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
      <main className="min-h-screen bg-fatman-900 text-white pt-28 lg:pt-32">
        <article className="mx-auto max-w-3xl px-6 pb-20 pt-6">
          <Link
            href="/blog"
            className="group inline-flex items-center text-sm font-semibold text-fatman-accent hover:text-fatman-accent-hover transition-colors duration-200"
          >
            <svg className="mr-1.5 h-4 w-4 transform transition-transform duration-200 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Garage Blog
          </Link>

          <header className="mt-8 border-b border-white/10 pb-8">
            <div className="mb-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white/50"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-3xl font-black leading-tight sm:text-4xl md:text-5xl text-white">
              {post.title}
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/60">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-fatman-accent/10 border border-fatman-accent/20 text-xs font-bold text-fatman-accent uppercase">
                {(post.author ?? "FP").substring(0, 2)}
              </div>
              <div>
                <span className="font-bold text-white/95">{post.author ?? "Fatman Parts"}</span>
                <span className="mx-2 text-white/30">·</span>
                <span>
                  {new Date(publishedDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
            {post.metaDescription ? (
              <p className="mt-6 text-lg leading-relaxed text-white/70 italic border-l-2 border-fatman-accent/50 pl-4 bg-white/[0.01] py-2 rounded-r-lg">
                {post.metaDescription}
              </p>
            ) : null}
          </header>

          {post.imageUrl ? (
            <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 shadow-lg shadow-black/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.imageUrl}
                alt={post.altText ?? post.title}
                className="max-h-[460px] w-full object-cover transition-transform duration-700 hover:scale-[1.01]"
              />
            </div>
          ) : null}

          <div
            className="prose mt-8 max-w-none"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />
        </article>
      </main>
    </>
  );
}
