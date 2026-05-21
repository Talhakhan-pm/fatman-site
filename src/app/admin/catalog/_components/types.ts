export type ApiResult = {
  endpoint: string;
  status: number;
  body: unknown;
};

export type AdminSessionScope = "write" | "seed";
export type AdminSessionState = "checking" | "locked" | "unlocked";

export type ProductSummary = {
  slug: string;
  sku: string;
  category_slug: string;
  brand: string;
  name: string;
  price: number | string;
  stock_status: "in-stock" | "low-stock" | "preorder";
  published: boolean;
};

export type UpsertPayload = {
  identity?: {
    originalSlug?: string | null;
    originalSku?: string | null;
  };
  product?: {
    sku?: string;
    slug?: string;
    category?: string;
    brand?: string;
    name?: string;
    shortDescription?: string;
    price?: number;
    compareAt?: number | null;
    stock?: "in-stock" | "low-stock" | "preorder";
    imageUrl?: string | null;
    shippingClass?: string | null;
    warrantyDays?: number | null;
    oemPartNumber?: string | null;
    published?: boolean;
  };
  fitment?: Array<{
    year?: string;
    make?: string;
    model?: string;
    variant?: string | null;
    engine?: string;
    matchType?: "fits" | "verify" | "no-fit";
    source?: string | null;
    notes?: string | null;
  }>;
  replaceFitment?: boolean;
};

export type ProductForm = {
  sku: string;
  slug: string;
  category: string;
  brand: string;
  name: string;
  shortDescription: string;
  price: string;
  compareAt: string;
  stock: "in-stock" | "low-stock" | "preorder";
  imageUrl: string;
  shippingClass: string;
  warrantyDays: string;
  oemPartNumber: string;
  published: boolean;
};

export type FitmentForm = {
  id: string;
  year: string;
  make: string;
  model: string;
  variant: string;
  engine: string;
  matchType: "fits" | "verify" | "no-fit";
  source: string;
  notes: string;
};

export type EditorState = {
  product: ProductForm;
  originalSlug: string | null;
  originalSku: string | null;
  fitment: FitmentForm[];
  replaceFitment: boolean;
};
