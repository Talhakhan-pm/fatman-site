import type { Product } from "@/lib/mock-data";


export function isPlaceholderProductImage(imageUrl?: string) {
  return Boolean(imageUrl && imageUrl.includes("picsum.photos/seed/fatman-"));
}

export function getProductDisplayMedia(product: Pick<Product, "category" | "imageUrl" | "name">) {
  if (product.imageUrl && !isPlaceholderProductImage(product.imageUrl)) {
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
