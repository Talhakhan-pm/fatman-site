import { formatPrice, type Product } from "@/lib/catalog";

function metadataFlag(product: Product, key: string) {
  return product.metadata?.[key] === true || product.metadata?.[key] === "true";
}

export function isQuoteRequired(product: Product) {
  return (
    metadataFlag(product, "quoteRequired") ||
    product.metadata?.priceStatus === "quote_required" ||
    product.price <= 0
  );
}

export function canAddProductToCart(product: Product) {
  return !isQuoteRequired(product);
}

export function formatProductPrice(product: Product) {
  return isQuoteRequired(product) ? "Call for price" : formatPrice(product.price);
}
