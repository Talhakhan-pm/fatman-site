import type { Product } from "@/lib/catalog";

/**
 * One entry of `product.metadata.images` — factory art attached by the
 * enrichment stage. `tier` records how the image was matched: "exact" means
 * component-level art, "parent" means subsystem-level art (honest captions
 * come from `alt`, never presented as a photo of the exact SKU).
 */
export type ProductGalleryImage = {
  url: string;
  alt: string;
  kind: "diagram" | "photo";
  tier: "exact" | "parent";
};

export type ProductDisplayMedia = {
  src: string | null;
  alt: string;
  isPhoto: boolean;
  /** What the primary image actually is; null when there is nothing to show. */
  kind: "diagram" | "photo" | null;
  gallery: ProductGalleryImage[];
};

function isValidProductImageUrl(imageUrl?: string) {
  if (!imageUrl) return false;

  const value = imageUrl.trim();
  if (!value) return false;

  return value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:image/") || value.startsWith("blob:");
}

export function isPlaceholderProductImage(imageUrl?: string) {
  return Boolean(imageUrl && imageUrl.includes("picsum.photos/seed/fatman-"));
}

/**
 * `metadata` is untyped jsonb straight from the pipeline, so every field is
 * validated before an entry is trusted — a malformed image record must degrade
 * to "no gallery", never crash a product page.
 */
function parseGalleryImages(metadata: Record<string, unknown> | undefined): ProductGalleryImage[] {
  const raw = metadata?.images;
  if (!Array.isArray(raw)) return [];

  const images: ProductGalleryImage[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const { url, alt, kind, tier } = entry as Record<string, unknown>;
    if (typeof url !== "string" || !isValidProductImageUrl(url) || isPlaceholderProductImage(url)) continue;
    if (kind !== "diagram" && kind !== "photo") continue;
    if (tier !== "exact" && tier !== "parent") continue;
    images.push({ url, alt: typeof alt === "string" ? alt.trim() : "", kind, tier });
  }
  return images;
}

export function getProductDisplayMedia(
  product: Pick<Product, "category" | "imageUrl" | "name" | "metadata">,
): ProductDisplayMedia {
  const gallery = parseGalleryImages(product.metadata);

  if (isValidProductImageUrl(product.imageUrl) && !isPlaceholderProductImage(product.imageUrl)) {
    return {
      src: product.imageUrl!.trim(),
      alt: product.name,
      isPhoto: true,
      kind: "photo",
      gallery,
    };
  }

  // No usable render — promote factory art so the product still gets a face.
  // Exact-tier component art wins over subsystem-level parent art.
  const promoted = gallery.find((image) => image.tier === "exact") ?? gallery[0];
  if (promoted) {
    return {
      src: promoted.url,
      alt: promoted.alt || product.name,
      isPhoto: true,
      kind: promoted.kind,
      gallery,
    };
  }

  return {
    src: null,
    alt: `${product.name} placeholder-free catalog card`,
    isPhoto: false,
    kind: null,
    gallery,
  };
}

/**
 * Any one image may front at most this many cards per rendered page. The
 * per-SKU crop/scale variation makes repeats read as different shots, so the
 * cap exists only to break up name-sorted single-image walls (e.g. sixty
 * "1ST Gear" rows sharing one render); at 2 it turned 44 of 60 transmission
 * cards into spec-plates, which reads worse than the repetition it hides.
 */
const MAX_IMAGE_REPEATS_PER_PAGE = 4;

/**
 * Per-page image dedup: walks the visible product array in render order and
 * returns the slugs whose card should suppress its photo (falling back to the
 * spec-plate card) because the same image already fronts too many earlier
 * cards. `blockedSrc` suppresses an image outright — the PDP passes the viewed
 * product's own image so "Also fits" never echoes it back.
 */
export function getSuppressedImageSlugs(
  products: Pick<Product, "slug" | "category" | "imageUrl" | "name" | "metadata">[],
  options?: { blockedSrc?: string | null },
): Set<string> {
  const counts = new Map<string, number>();
  const suppressed = new Set<string>();

  for (const product of products) {
    const src = getProductDisplayMedia(product).src;
    if (!src) continue;
    if (options?.blockedSrc && src === options.blockedSrc) {
      suppressed.add(product.slug);
      continue;
    }
    const seen = (counts.get(src) ?? 0) + 1;
    counts.set(src, seen);
    if (seen > MAX_IMAGE_REPEATS_PER_PAGE) suppressed.add(product.slug);
  }

  return suppressed;
}
