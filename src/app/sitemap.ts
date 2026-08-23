import type { MetadataRoute } from "next";
import { getCategories, getProductSlugs } from "@/lib/catalog-db";
import { getPublishedBlogPosts } from "@/lib/blog-db";

const SITE_URL = "https://fatmanparts.com";

/**
 * Slugs safe to place in a <loc> unescaped. Anything else (whitespace,
 * punctuation, control characters) is dropped rather than encoded: a slug
 * that shape is test/import junk, and percent-encoding it would only
 * publish a valid-looking URL pointing at a junk page. Search Console
 * rejected the whole sitemap over one such entry.
 */
const VALID_SLUG = /^[A-Za-z0-9][A-Za-z0-9._~-]*$/;

/**
 * lastModified is omitted where we have no real timestamp. Emitting
 * `new Date()` — as this route used to for every product, category and
 * static page — tells Google all 18k URLs changed on every fetch, and
 * Google's documented response is to distrust lastmod for the whole site,
 * which suppresses recrawl scheduling.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products, blogPosts] = await Promise.all([
    getCategories(),
    getProductSlugs(),
    getPublishedBlogPosts(500),
  ]);

  // /cart and /checkout are transactional: never indexable, so never listed.
  const staticPages: MetadataRoute.Sitemap = [
    "",
    "/blog",
    "/about",
    "/contact",
    "/shipping",
    "/payment-methods",
    "/cancellation-policy",
    "/returns",
    "/warranty",
    "/fitment-help",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories
    .filter((category) => VALID_SLUG.test(category.slug))
    .map((category) => ({
      url: `${SITE_URL}/category/${category.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));

  const productPages: MetadataRoute.Sitemap = products
    .filter((product) => VALID_SLUG.test(product.slug))
    .map((product) => ({
      url: `${SITE_URL}/product/${product.slug}`,
      ...(product.updatedAt ? { lastModified: new Date(product.updatedAt) } : {}),
      changeFrequency: "daily" as const,
      priority: 0.9,
    }));

  const blogPages: MetadataRoute.Sitemap = blogPosts
    .filter((post) => VALID_SLUG.test(post.slug))
    .map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  return [...staticPages, ...categoryPages, ...productPages, ...blogPages];
}
