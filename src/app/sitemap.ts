import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/catalog-db";
import { getPublishedBlogPosts } from "@/lib/blog-db";

const SITE_URL = "https://fatmanparts.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products, blogPosts] = await Promise.all([
    getCategories(),
    getProducts(),
    getPublishedBlogPosts(500),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    "",
    "/blog",
    "/about",
    "/contact",
    "/cart",
    "/checkout",
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
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE_URL}/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/product/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  }));

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...productPages, ...blogPages];
}
