import type { Product } from "@/lib/catalog";

function isValidProductImageUrl(imageUrl?: string) {
  if (!imageUrl) return false;

  const value = imageUrl.trim();
  if (!value) return false;

  return value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:image/") || value.startsWith("blob:");
}

export function isPlaceholderProductImage(imageUrl?: string) {
  return Boolean(imageUrl && imageUrl.includes("picsum.photos/seed/fatman-"));
}

export function getProductDisplayMedia(product: Pick<Product, "category" | "imageUrl" | "name">) {
  if (isValidProductImageUrl(product.imageUrl) && !isPlaceholderProductImage(product.imageUrl)) {
    return {
      src: product.imageUrl,
      alt: product.name,
      isPhoto: true,
    };
  }

  return {
    src: null,
    alt: `${product.name} placeholder-free catalog card`,
    isPhoto: false,
  };
}
