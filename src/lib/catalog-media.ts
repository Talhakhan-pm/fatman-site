import type { Product } from "@/lib/mock-data";

export type CategorySlug = Product["category"];

export const categoryMedia: Partial<Record<CategorySlug, { src: string; alt: string }>> = {
  engines: {
    src: "/editorial/fatman-engine-warehouse-hero.png",
    alt: "Engines organized in a warehouse aisle",
  },
  "oem-parts": {
    src: "/editorial/fatman-parts-pick-warehouse-aisle.png",
    alt: "OEM parts being picked from warehouse shelves",
  },
  electrical: {
    src: "/editorial/fatman-headlight-studio-detail.png",
    alt: "OEM headlight assembly detail",
  },
};

export function isPlaceholderProductImage(imageUrl?: string) {
  return Boolean(imageUrl && imageUrl.includes("picsum.photos/seed/fatman-"));
}

export function getCategoryMedia(category: CategorySlug) {
  return categoryMedia[category] ?? null;
}

export function getProductDisplayMedia(product: Pick<Product, "category" | "imageUrl" | "name">) {
  if (product.imageUrl && !isPlaceholderProductImage(product.imageUrl)) {
    return {
      src: product.imageUrl,
      alt: product.name,
      isPhoto: true,
    };
  }

  const categoryAsset = getCategoryMedia(product.category);
  if (categoryAsset) {
    return {
      ...categoryAsset,
      isPhoto: true,
    };
  }

  return {
    src: null,
    alt: `${product.name} placeholder-free catalog card`,
    isPhoto: false,
  };
}
