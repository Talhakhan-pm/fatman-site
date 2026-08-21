import type { FitmentCatalog, Vehicle } from "@fatman/fitment-react";

/**
 * Maps an NHTSA VIN decode onto the CHARM catalog's vocabulary.
 *
 * NHTSA says { make: "FORD", model: "F-150", driveType: "4WD/4-Wheel Drive",
 * engine: "8 cyl 5.4L ..." }; the catalog says model "F 150 4WD Pickup",
 * engine "V8-330 5.4L". Nothing lines up letter-for-letter, so each level is
 * resolved by scoring the catalog's options against the decoded fields —
 * and if a level can't be resolved confidently, the match fails (null)
 * rather than guessing a vehicle the shopper didn't name.
 */

export type DecodedVin = {
  year?: string;
  make?: string;
  model?: string;
  trim?: string;
  engine?: string;
  bodyClass?: string;
  driveType?: string;
};

const norm = (value: string | undefined | null) =>
  (value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

function pickMake(decoded: DecodedVin, makes: string[]): string | null {
  const target = norm(decoded.make);
  if (!target) return null;
  return (
    makes.find((make) => norm(make) === target) ??
    makes.find((make) => norm(make).includes(target) || target.includes(norm(make))) ??
    null
  );
}

function driveHint(decoded: DecodedVin): "4wd" | "2wd" | null {
  const text = norm(`${decoded.driveType} ${decoded.trim}`);
  if (text.includes("4wd") || text.includes("4wheel") || text.includes("awd")) return "4wd";
  if (
    text.includes("2wd") ||
    text.includes("rwd") ||
    text.includes("fwd") ||
    text.includes("rearwheel") ||
    text.includes("frontwheel")
  )
    return "2wd";
  return null;
}

function scoreModel(candidate: string, decoded: DecodedVin): number {
  const cand = norm(candidate);
  const target = norm(decoded.model);
  if (!cand || !target) return 0;

  let score = 0;
  if (cand === target) score = 100;
  else if (cand.startsWith(target)) score = 90;
  else if (cand.includes(target)) score = 75;
  else if (target.includes(cand)) score = 60;
  else return 0;

  const drive = driveHint(decoded);
  if (drive) {
    if (cand.includes(drive)) score += 15;
    else if (cand.includes(drive === "4wd" ? "2wd" : "4wd")) score -= 15;
  }

  const body = norm(decoded.bodyClass);
  if (body && cand.includes("pickup") && body.includes("pickup")) score += 5;

  return score;
}

function parseEngineSpecs(decoded: DecodedVin): { displacement: string | null; cylinders: string | null } {
  const text = decoded.engine ?? "";
  const disp = text.match(/(\d+(?:\.\d+)?)\s*l/i);
  const cyl = text.match(/(\d+)\s*cyl/i);
  return {
    displacement: disp ? Number.parseFloat(disp[1]).toFixed(1) : null,
    cylinders: cyl ? cyl[1] : null,
  };
}

// Technical descriptors that appear in engine labels but never in NHTSA's
// trim/series fields; they carry no edition information.
const ENGINE_NOISE_TOKENS = new Set([
  "vin", "sohc", "dohc", "ohv", "efi", "mfi", "sfi", "cng", "gas", "diesel", "turbo", "flex",
]);

function scoreEngine(
  candidate: string,
  specs: { displacement: string | null; cylinders: string | null },
  decoded: DecodedVin,
): number {
  let score = 0;
  if (specs.displacement) {
    // "5.0" matches the "5.0L" segment of "V8-302 5.0L".
    if (new RegExp(`(^|[^0-9.])${specs.displacement.replace(".", "\\.")}\\s*l`, "i").test(candidate)) {
      score += 100;
    }
  }
  if (specs.cylinders && new RegExp(`[vli][-\\s]?${specs.cylinders}(?![0-9])`, "i").test(candidate)) {
    score += 50;
  }

  // Edition names inside the engine label ("... 5.0L COBRA") should agree
  // with the decoded trim: reward a match, penalise an edition the VIN
  // doesn't claim — otherwise a GT could land on the Cobra engine.
  const editionContext = norm(`${decoded.trim} ${decoded.model} ${decoded.bodyClass}`);
  for (const token of candidate.toLowerCase().split(/[^a-z]+/)) {
    if (token.length < 3 || ENGINE_NOISE_TOKENS.has(token)) continue;
    if (editionContext.includes(token)) score += 10;
    else score -= 5;
  }
  return score;
}

export function matchVinToCatalog(decoded: DecodedVin, catalog: FitmentCatalog): Vehicle | null {
  const year = decoded.year?.trim();
  if (!year || !catalog.years.includes(year)) return null;

  const make = pickMake(decoded, catalog.getMakes(year));
  if (!make) return null;

  const models = catalog.getModels(year, make);
  let bestModel: string | null = null;
  let bestModelScore = 0;
  for (const candidate of models) {
    const score = scoreModel(candidate, decoded);
    if (score > bestModelScore) {
      bestModel = candidate;
      bestModelScore = score;
    }
  }
  if (!bestModel) return null;

  const specs = parseEngineSpecs(decoded);
  const variants = catalog.getVariants(year, make, bestModel);
  const variantCandidates = variants.length ? variants : [""];

  // Resolve variant and engine together: the right variant is the one whose
  // engine list actually contains the decoded engine.
  let best: { variant: string; engine: string; score: number } | null = null;
  for (const variant of variantCandidates) {
    const engines = catalog.getEngines(year, make, bestModel, variant);
    for (const engine of engines) {
      let score = scoreEngine(engine, specs, decoded);
      if (engines.length === 1 && score === 0 && !specs.displacement) score = 40;
      const trimBonus =
        variant && norm(`${decoded.trim} ${decoded.bodyClass}`).includes(norm(variant)) ? 10 : 0;
      score += trimBonus;
      if (!best || score > best.score) best = { variant, engine, score };
    }
  }

  // Displacement agreement (or a lone engine option) is the confidence bar;
  // anything weaker risks confirming a vehicle the shopper doesn't own.
  if (!best || best.score < 40) return null;

  const vehicle: Vehicle = {
    year,
    make,
    model: bestModel,
    variant: best.variant || undefined,
    engine: best.engine,
  };

  return catalog.hasVehicle(vehicle) ? vehicle : null;
}
