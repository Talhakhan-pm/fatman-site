import { generatedCategories, generatedProducts } from "@/lib/generated-data";

export type Product = {
  sku: string;
  slug: string;
  category: "engines" | "brakes" | "oem-parts" | "drivetrain" | "cooling" | "electrical" | "suspension";
  brand: string;
  name: string;
  shortDescription: string;
  price: number;
  compareAt?: number;
  stock: "in-stock" | "low-stock" | "preorder";
  imageUrl?: string;
  shippingClass?: string;
  warrantyDays?: number;
  oemPartNumber?: string;
};

export type Category = {
  slug: Product["category"];
  title: string;
  description: string;
};

export const categories: Category[] = generatedCategories as unknown as Category[];

export const products: Product[] = generatedProducts as unknown as Product[];

export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export function getCategory(slug: string) {
  return categories.find((item) => item.slug === slug);
}

export function getProductsByCategory(slug: string) {
  return products.filter((item) => item.category === slug);
}

export function getProduct(slug: string) {
  return products.find((item) => item.slug === slug);
}
