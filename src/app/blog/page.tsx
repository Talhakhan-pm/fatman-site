import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedBlogPosts } from "@/lib/blog-db";

const SITE_URL = "https://fatmanparts.com";

export const metadata: Metadata = {
  title: "Fatman Garage Blog",
  description: "Funny tone. Useful info. Zero fluff. Get expert tips on buying auto parts, OEM vs aftermarket, VIN fitment decoding, and DIY garage projects.",
  alternates: {
    canonical: "/blog",
  },
};

type BlogCardPost = {
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  imageUrl?: string | null;
  altText?: string | null;
  author?: string | null;
  publishedAt?: string;
};

const fallbackPosts: BlogCardPost[] = [
  {
    title: "How to Avoid Buying the Wrong Engine Part",
    slug: "avoid-buying-wrong-engine-part",
    excerpt: "Use YMME + VIN verification to cut return pain and downtime.",
    tags: ["fitment"],
  },
  {
    title: "OEM vs Aftermarket: What Actually Matters",
    slug: "oem-vs-aftermarket-what-matters",
    excerpt: "The truth: quality, fitment consistency, and total cost over time.",
    tags: ["oem"],
  },
  {
    title: "Fast Shipping Myths in Auto Parts",
    slug: "fast-shipping-myths-auto-parts",
    excerpt: "What 'ships fast' should really mean before you click checkout.",
    tags: ["shipping"],
  },
];

export default async function BlogPage() {
  const publishedPosts = await getPublishedBlogPosts(50);
  const posts: BlogCardPost[] = publishedPosts.length
    ? publishedPosts.map((post) => ({
        title: post.title,
        slug: post.slug,
        excerpt: post.metaDescription ?? "Fatman Parts garage guide.",
        tags: post.tags,
        imageUrl: post.imageUrl,
        altText: post.altText ?? post.title,
        author: post.author,
        publishedAt: post.publishedAt ?? post.updatedAt,
      }))
    : fallbackPosts;

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Fatman Garage Blog",
    "description": "Expert tips on buying auto parts, OEM vs aftermarket, and DIY garage projects.",
    "url": `${SITE_URL}/blog`,
    "publisher": {
      "@type": "Organization",
      "name": "Fatman Parts",
      "logo": `${SITE_URL}/brand/fatman-fp-shield.png`,
    },
    "blogPost": posts.map((post) => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "url": `${SITE_URL}/blog/${post.slug}`,
      "publisher": {
        "@type": "Organization",
        "name": "Fatman Parts",
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />
      <div className="min-h-screen bg-fatman-900 text-white pt-28 lg:pt-32">
        <section className="mx-auto max-w-6xl px-6 pb-20 pt-6">
          <div className="border-b border-white/10 pb-8 mb-10">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-fatman-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-fatman-accent animate-pulse" />
              Expert Garage Guide
            </div>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Fatman Garage Blog
            </h1>
            <p className="mt-3 text-base text-white/60 max-w-xl">
              Funny tone. Useful info. Zero fluff. Get expert tips on buying auto parts, OEM vs aftermarket, VIN fitment decoding, and DIY garage projects.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1 hover:border-fatman-accent/40 hover:bg-white/[0.06] hover:shadow-[0_20px_50px_rgba(234,88,12,0.12)]"
              >
                {typeof post.imageUrl === "string" && post.imageUrl ? (
                  <div className="relative h-48 w-full overflow-hidden border-b border-white/5 bg-black/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.imageUrl}
                      alt={post.altText ?? post.title}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                ) : (
                  <div className="relative h-48 w-full overflow-hidden border-b border-white/5 bg-black/10 flex items-center justify-center">
                    <span className="text-xs font-black uppercase tracking-widest text-white/20">Fatman Parts Guide</span>
                  </div>
                )}
                
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-4 flex flex-wrap gap-2">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white/50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <h2 className="text-xl font-black tracking-tight text-white group-hover:text-fatman-accent transition-colors duration-200">
                    <Link href={`/blog/${post.slug}`} className="focus:outline-none">
                      {post.title}
                    </Link>
                  </h2>
                  
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/60">
                    {post.excerpt}
                  </p>
                  
                  <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center text-sm font-bold text-fatman-accent group-hover:text-fatman-accent-hover transition-colors duration-200"
                    >
                      Read Article
                      <svg className="ml-1.5 h-4 w-4 transform transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    {post.publishedAt ? (
                      <span className="text-xs text-white/30">
                        {new Date(post.publishedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
