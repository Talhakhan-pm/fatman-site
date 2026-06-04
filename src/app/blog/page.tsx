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
      <div className="min-h-screen bg-fatman-900 text-white">
        <section className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-3xl font-black">Fatman Garage Blog</h1>
          <p className="mt-2 text-white/70">Funny tone. Useful info. Zero fluff.</p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {posts.map((post) => (
              <article key={post.slug} className="overflow-hidden rounded-xl border border-white/15 bg-white/5">
                {typeof post.imageUrl === "string" && post.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.imageUrl} alt={post.altText ?? post.title} className="h-40 w-full object-cover" />
                ) : null}
                <div className="p-5">
                  <div className="mb-3 flex flex-wrap gap-2">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/70">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-lg font-semibold">
                    <Link href={`/blog/${post.slug}`} className="hover:text-fatman-300">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-2 text-sm text-white/70">{post.excerpt}</p>
                  <Link href={`/blog/${post.slug}`} className="mt-4 inline-flex text-sm font-semibold text-fatman-300 hover:text-fatman-200">
                    Read more →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
