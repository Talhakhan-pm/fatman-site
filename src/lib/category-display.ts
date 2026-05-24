import type { RegistryIconKey } from "@/lib/catalog-registry";

const CATEGORY_ICON_PREFIXES: Array<[prefix: string, icon: RegistryIconKey]> = [
  ["transmission-and-drivetrain", "transmission"],
  ["transmission-drivetrain", "transmission"],
  ["engine-cooling-and-exhaust", "engine"],
  ["engine-cooling-exhaust", "engine"],
  ["powertrain-management", "electrical"],
  ["brakes-and-traction-control", "brake"],
  ["brakes-traction-control", "brake"],
  ["steering-and-suspension", "suspension"],
  ["steering-suspension", "suspension"],
  ["starting-and-charging", "electrical"],
  ["sensors-and-switches", "electrical"],
  ["sensors-switches", "electrical"],
  ["body-and-frame", "suspension"],
  ["body-frame", "suspension"],
  ["heating-and-air-conditioning", "engine"],
  ["instrument-panel-gauges", "electrical"],
  ["instrument-panel-gauges-and-warning-indicators", "electrical"],
  ["maintenance", "engine"],
];

const SLUG_PREFIXES_TO_STRIP = [
  "transmission-and-drivetrain",
  "transmission-drivetrain",
  "engine-cooling-and-exhaust",
  "engine-cooling-exhaust",
  "powertrain-management",
  "brakes-and-traction-control",
  "brakes-traction-control",
  "steering-and-suspension",
  "steering-suspension",
  "starting-and-charging",
  "sensors-and-switches",
  "sensors-switches",
  "body-and-frame",
  "body-frame",
  "heating-and-air-conditioning",
  "instrument-panel-gauges-and-warning-indicators",
  "instrument-panel-gauges",
  "maintenance",
];

const CATEGORY_GROUP_WORDS = new Set([
  "automatic",
  "manual",
  "transmission",
  "transaxle",
  "drivetrain",
  "drive",
  "axles",
  "bearings",
  "joints",
  "engine",
  "cooling",
  "exhaust",
  "system",
  "hydraulic",
  "disc",
  "drum",
  "parking",
  "brake",
  "steering",
  "suspension",
  "charging",
  "starting",
  "body",
  "frame",
  "doors",
  "hood",
  "trunk",
  "compressor",
  "hvac",
]);

function titleCase(words: string[]) {
  return words
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function stripHashishSuffix(words: string[]) {
  return words.filter((word) => !/^[a-f0-9]{8,}$/i.test(word));
}

function collapseConsecutiveDuplicates(words: string[]) {
  return words.filter((word, index) => index === 0 || word !== words[index - 1]);
}

export function getIconForCategorySlug(slug: string): RegistryIconKey {
  const normalized = slug.toLowerCase();
  return CATEGORY_ICON_PREFIXES.find(([prefix]) => normalized.startsWith(prefix))?.[1] ?? "engine";
}

export function humanizeCategorySlug(slug: string): string {
  const normalized = slug.toLowerCase();
  const prefix = SLUG_PREFIXES_TO_STRIP.find((candidate) => normalized.startsWith(`${candidate}-`));
  const withoutPrefix = prefix ? normalized.slice(prefix.length + 1) : normalized;
  const words = collapseConsecutiveDuplicates(stripHashishSuffix(withoutPrefix.split("-").filter(Boolean)));

  if (!words.length) return slug.replace(/-/g, " ");

  const leafWords = words.filter((word, index) => {
    if (index >= words.length - 3) return true;
    return !CATEGORY_GROUP_WORDS.has(word);
  });

  const compactLeaf = leafWords.slice(-3);
  const displayWords = compactLeaf.length ? compactLeaf : words.slice(-3);
  if (displayWords.length > 2 && displayWords[0] === displayWords[displayWords.length - 1]) {
    displayWords.shift();
  }
  return titleCase(displayWords);
}
