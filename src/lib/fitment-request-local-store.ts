import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const STORE_PATH = path.join(process.cwd(), "data", "fitment-requests-local.json");

type JsonObject = Record<string, unknown>;

export type LocalFitmentRequest = {
  id: string;
  status: "new" | "reviewing" | "resolved" | "closed";
  source: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  vin: string;
  productSlug: string | null;
  productSku: string | null;
  productName: string | null;
  vehicleYear: string | null;
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleTrim: string | null;
  vehicleEngine: string | null;
  decodedVehicle: JsonObject;
  message: string | null;
  metadata: JsonObject;
  createdAt: string;
  updatedAt: string;
};

type LocalFitmentRequestStore = {
  requests: LocalFitmentRequest[];
};

async function readStore(): Promise<LocalFitmentRequestStore> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<LocalFitmentRequestStore> | null;
    return { requests: Array.isArray(parsed?.requests) ? parsed.requests : [] };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { requests: [] };
    }
    throw error;
  }
}

async function writeStore(store: LocalFitmentRequestStore) {
  await mkdir(path.dirname(STORE_PATH), { recursive: true });
  await writeFile(STORE_PATH, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

export async function listLocalFitmentRequests() {
  const store = await readStore();
  return store.requests;
}

export async function createLocalFitmentRequest(
  request: Omit<LocalFitmentRequest, "id" | "createdAt" | "updatedAt">,
) {
  const now = new Date().toISOString();
  const record: LocalFitmentRequest = {
    ...request,
    id: `local-fitment-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    updatedAt: now,
  };

  const store = await readStore();
  store.requests = [record, ...store.requests];
  await writeStore(store);
  return record;
}
