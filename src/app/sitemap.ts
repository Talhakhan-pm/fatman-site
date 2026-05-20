import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/catalog-db";

const SITE_URL = "https://fatmanparts.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

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

  return [...staticPages, ...categoryPages, ...productPages];
}
