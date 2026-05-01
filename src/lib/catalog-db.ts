import { createSupabaseServerClient } from "@/lib/supabase";
import {
  categories as fallbackCategories,
  getCategory as getFallbackCategory,
  getProduct as getFallbackProduct,
  getProductsByCategory as getFallbackProductsByCategory,
  products as fallbackProducts,
  type Category,
  type Product,
} from "@/lib/catalog";

type SupabaseCategoryRow = {
  slug: string;
  title: string;
  description: string | null;
  short_description: string | null;
  published: boolean;
};

type SupabaseProductRow = {
  sku: string;
  slug: string;
  category_slug: Product["category"];
  brand: string;
  name: string;
  short_description: string | null;
  price: number | string;
  compare_at: number | string | null;
  stock_status: Product["stock"];
  image_url: string | null;
  shipping_class: string | null;
  warranty_days: number | null;
  oem_part_number: string | null;
  published: boolean;
};

const toProduct = (row: SupabaseProductRow): Product => ({
  sku: row.sku,
  slug: row.slug,
  category: row.category_slug,
  brand: row.brand,
  name: row.name,
  shortDescription: row.short_description ?? "",
  price: Number(row.price),
  compareAt: row.compare_at == null ? undefined : Number(row.compare_at),
  stock: row.stock_status,
  imageUrl: row.image_url ?? undefined,
  shippingClass: row.shipping_class ?? undefined,
  warrantyDays: row.warranty_days ?? undefined,
  oemPartNumber: row.oem_part_number ?? undefined,
});

const toCategories = (
  rows: SupabaseCategoryRow[],
  products: Product[],
): Category[] =>
  rows.map((row) => {
    const categoryProducts = products.filter((product) => product.category === row.slug);
    const realImageCount = categoryProducts.filter((product) => Boolean(product.imageUrl)).length;
    return {
      slug: row.slug as Category["slug"],
      title: row.title,
      description: row.description ?? row.short_description ?? "",
      productCount: categoryProducts.length,
      realImageCount,
    };
  });

async function readPublishedCatalogFromSupabase() {
  try {
    const supabase = createSupabaseServerClient();
    const [{ data: productRows, error: productsError }, { data: categoryRows, error: categoriesError }] =
      await Promise.all([
        supabase
          .from("products")
          .select(
            "sku, slug, category_slug, brand, name, short_description, price, compare_at, stock_status, image_url, shipping_class, warranty_days, oem_part_number, published",
          )
          .eq("published", true)
          .order("name", { ascending: true }),
        supabase
          .from("categories")
          .select("slug, title, description, short_description, published")
          .eq("published", true)
          .order("sort_order", { ascending: true }),
      ]);

    if (productsError || categoriesError) {
      console.warn("Supabase catalog read failed, falling back to source data.", {
        productsError,
        categoriesError,
      });
      return null;
    }

    if (!productRows?.length || !categoryRows?.length) return null;

    const products = (productRows as SupabaseProductRow[]).map(toProduct);
    const categories = toCategories(categoryRows as SupabaseCategoryRow[], products);
    return { products, categories };
  } catch (error) {
    console.warn("Supabase catalog unavailable, falling back to source data.", error);
    return null;
  }
}

export async function getCatalogData() {
  return (await readPublishedCatalogFromSupabase()) ?? {
    products: fallbackProducts,
    categories: fallbackCategories,
  };
}

export async function getCategories() {
  return (await getCatalogData()).categories;
}

export async function getProducts() {
  return (await getCatalogData()).products;
}

export async function getCategory(slug: string) {
  const db = await readPublishedCatalogFromSupabase();
  if (!db) return getFallbackCategory(slug);
  return db.categories.find((item) => item.slug === slug);
}

export async function getProductsByCategory(slug: string) {
  const db = await readPublishedCatalogFromSupabase();
  if (!db) return getFallbackProductsByCategory(slug);
  return db.products.filter((item) => item.category === slug);
}

export async function getProduct(slug: string) {
  const db = await readPublishedCatalogFromSupabase();
  if (!db) return getFallbackProduct(slug);
  return db.products.find((item) => item.slug === slug);
}
