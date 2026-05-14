import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const STORE_PATH = path.join(process.cwd(), "data", "admin-catalog-local.json");

type JsonObject = Record<string, unknown>;

export type LocalCatalogProduct = {
  sku: string;
  slug: string;
  category: string;
  brand: string;
  name: string;
  shortDescription: string;
  price: number;
  compareAt: number | null;
  stock: "in-stock" | "low-stock" | "preorder";
  imageUrl: string | null;
  shippingClass: string | null;
  warrantyDays: number | null;
  oemPartNumber: string | null;
  published: boolean;
  metadata: JsonObject;
};

export type LocalCatalogFitment = {
  year: string;
  make: string;
  model: string;
  variant: string | null;
  engine: string;
  matchType: "fits" | "verify" | "no-fit";
  source: string;
  confidence: number | null;
  notes: string | null;
};

export type LocalCatalogRecord = {
  product: LocalCatalogProduct;
  fitment: LocalCatalogFitment[];
  replaceFitment: boolean;
  updatedAt: string;
};

type LocalCatalogStore = {
  products: Record<string, LocalCatalogRecord>;
};

function createEmptyStore(): LocalCatalogStore {
  return { products: {} };
}

async function readStore(): Promise<LocalCatalogStore> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<LocalCatalogStore> | null;
    return {
      products:
        parsed && parsed.products && typeof parsed.products === "object"
          ? (parsed.products as Record<string, LocalCatalogRecord>)
          : {},
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return createEmptyStore();
    }
    throw error;
  }
}

async function writeStore(store: LocalCatalogStore) {
  await mkdir(path.dirname(STORE_PATH), { recursive: true });
  await writeFile(STORE_PATH, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

export async function getLocalCatalogRecord(slug: string) {
  const store = await readStore();
  return store.products[slug] ?? null;
}

export async function listLocalCatalogRecords() {
  const store = await readStore();
  return Object.values(store.products);
}

export async function upsertLocalCatalogRecord(
  record: Omit<LocalCatalogRecord, "updatedAt"> | LocalCatalogRecord,
) {
  const store = await readStore();
  store.products[record.product.slug] = {
    ...record,
    updatedAt: "updatedAt" in record ? record.updatedAt : new Date().toISOString(),
  };
  await writeStore(store);
  return store.products[record.product.slug];
}
