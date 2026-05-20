import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const STORE_PATH = path.join(process.cwd(), "data", "contact-requests-local.json");

type JsonObject = Record<string, unknown>;

export type LocalContactRequest = {
  id: string;
  status: "new" | "reviewing" | "resolved" | "closed";
  source: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  subject: string | null;
  vin: string | null;
  orderNumber: string | null;
  productSlug: string | null;
  productSku: string | null;
  productName: string | null;
  message: string;
  metadata: JsonObject;
  createdAt: string;
  updatedAt: string;
};

type LocalContactRequestStore = {
  requests: LocalContactRequest[];
};

async function readStore(): Promise<LocalContactRequestStore> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<LocalContactRequestStore> | null;
    return { requests: Array.isArray(parsed?.requests) ? parsed.requests : [] };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { requests: [] };
    throw error;
  }
}

async function writeStore(store: LocalContactRequestStore) {
  await mkdir(path.dirname(STORE_PATH), { recursive: true });
  await writeFile(STORE_PATH, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

export async function listLocalContactRequests() {
  const store = await readStore();
  return store.requests;
}

export async function createLocalContactRequest(
  request: Omit<LocalContactRequest, "id" | "createdAt" | "updatedAt">,
) {
  const now = new Date().toISOString();
  const record: LocalContactRequest = {
    ...request,
    id: `local-contact-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    updatedAt: now,
  };

  const store = await readStore();
  store.requests = [record, ...store.requests];
  await writeStore(store);
  return record;
}
