export type VinDecodeResult = {
  vin: string;
  valid: boolean;
  error?: string;
  year?: string;
  make?: string;
  model?: string;
  trim?: string;
  engine?: string;
  bodyClass?: string;
  driveType?: string;
  plantCountry?: string;
  raw?: Record<string, unknown>;
};

const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;
const VIN_TRANSLITERATION: Record<string, number> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  G: 7,
  H: 8,
  J: 1,
  K: 2,
  L: 3,
  M: 4,
  N: 5,
  P: 7,
  R: 9,
  S: 2,
  T: 3,
  U: 4,
  V: 5,
  W: 6,
  X: 7,
  Y: 8,
  Z: 9,
};
const VIN_WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function vinCharacterValue(character: string) {
  if (/\d/.test(character)) return Number(character);
  return VIN_TRANSLITERATION[character] ?? Number.NaN;
}

export function normalizeVin(value: string) {
  return value.trim().toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "");
}

export function validateVin(vin: string) {
  const normalized = normalizeVin(vin);

  if (normalized.length !== 17) {
    return { valid: false, vin: normalized, error: "VIN must be 17 characters." };
  }

  if (!VIN_PATTERN.test(normalized)) {
    return { valid: false, vin: normalized, error: "VIN can only contain letters/numbers and cannot include I, O, or Q." };
  }

  let sum = 0;
  for (let index = 0; index < normalized.length; index += 1) {
    const value = vinCharacterValue(normalized[index]);
    if (Number.isNaN(value)) {
      return { valid: false, vin: normalized, error: "VIN contains an invalid character." };
    }
    sum += value * VIN_WEIGHTS[index];
  }

  const remainder = sum % 11;
  const expected = remainder === 10 ? "X" : String(remainder);

  if (normalized[8] !== expected) {
    return { valid: false, vin: normalized, error: "VIN check digit does not match." };
  }

  return { valid: true, vin: normalized };
}

export async function decodeVinWithNhtsa(vinInput: string): Promise<VinDecodeResult> {
  const validation = validateVin(vinInput);
  if (!validation.valid) {
    return {
      vin: validation.vin,
      valid: false,
      error: validation.error,
    };
  }

  const url = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/${encodeURIComponent(validation.vin)}?format=json`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 * 60 * 24 * 30 },
  });

  if (!response.ok) {
    return {
      vin: validation.vin,
      valid: false,
      error: `VIN decoder unavailable (${response.status}).`,
    };
  }

  const json = (await response.json()) as { Results?: Array<Record<string, unknown>> };
  const row = json.Results?.[0] ?? {};
  const errorCode = clean(row.ErrorCode);
  const errorText = clean(row.ErrorText);
  const hasSeriousDecodeError = errorCode
    .split(",")
    .map((code) => code.trim())
    .filter(Boolean)
    .some((code) => !["0", "14"].includes(code));

  if (hasSeriousDecodeError) {
    return {
      vin: validation.vin,
      valid: false,
      error: errorText || "VIN could not be decoded.",
      raw: row,
    };
  }

  const engine = [clean(row.EngineCylinders) ? `${clean(row.EngineCylinders)} cyl` : "", clean(row.DisplacementL) ? `${clean(row.DisplacementL)}L` : "", clean(row.EngineModel)]
    .filter(Boolean)
    .join(" ");

  return {
    vin: validation.vin,
    valid: true,
    year: clean(row.ModelYear),
    make: clean(row.Make),
    model: clean(row.Model),
    trim: clean(row.Trim) || clean(row.Series),
    engine: engine || clean(row.EngineConfiguration) || clean(row.FuelTypePrimary),
    bodyClass: clean(row.BodyClass),
    driveType: clean(row.DriveType),
    plantCountry: clean(row.PlantCountry),
    raw: row,
  };
}
