#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dataDir = path.resolve(root, "../fatman-data");
const productsCsv = path.join(dataDir, "products.csv");
const fitmentCsv = path.join(dataDir, "fitment.csv");
const registryFile = path.join(root, "src/lib/catalog-registry.json");
const baselineFile = path.join(root, "scripts/catalog-baseline.json");
const requiredCategories = ["engines", "brakes", "oem-parts", "suspension"];
const uiFilesThatShouldUseRegistry = [
  "src/app/page.tsx",
  "src/components/site-header.tsx",
  "src/components/site-footer.tsx",
];

function parseCsv(filePath) {
  const raw = fs.readFileSync(filePath, "utf8").trim();
  const rows = [];
  let current = "";
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < raw.length; i += 1) {
    const char = raw[i];
    const next = raw[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(current);
      rows.push(row);
      row = [];
      current = "";
      continue;
    }

    current += char;
  }

  row.push(current);
  rows.push(row);

  const [headers, ...dataRows] = rows;
  return dataRows.map((cols, index) => {
    const record = { rowNumber: index + 2 };
    headers.forEach((header, colIndex) => {
      record[header] = cols[colIndex] ?? "";
    });
    return record;
  });
}

function isPlaceholderImage(imageUrl) {
  return imageUrl?.includes("picsum.photos/seed/fatman-") ?? false;
}

function isValidImageUrl(imageUrl) {
  if (!imageUrl?.trim()) return false;
  return /^(\/|https?:\/\/|data:image\/|blob:)/.test(imageUrl.trim());
}

function bucketProducts(products) {
  const buckets = {};
  for (const product of products) {
    if (!buckets[product.category]) {
      buckets[product.category] = {
        productCount: 0,
        realImageCount: 0,
        placeholderImageCount: 0,
        missingImageCount: 0,
      };
    }

    const bucket = buckets[product.category];
    bucket.productCount += 1;

    if (!product.image_url?.trim()) {
      bucket.missingImageCount += 1;
      continue;
    }

    if (isPlaceholderImage(product.image_url)) {
      bucket.placeholderImageCount += 1;
      continue;
    }

    if (isValidImageUrl(product.image_url)) {
      bucket.realImageCount += 1;
    }
  }
  return buckets;
}

function fileExistsForPublicUrl(imageUrl) {
  if (!imageUrl.startsWith("/")) return true;
  const target = path.join(root, "public", imageUrl.replace(/^\//, ""));
  return fs.existsSync(target);
}

const args = new Set(process.argv.slice(2));
const writeBaseline = args.has("--write-baseline");

const products = parseCsv(productsCsv);
parseCsv(fitmentCsv); // ensure file exists / parses before reporting success
const registry = JSON.parse(fs.readFileSync(registryFile, "utf8"));
const registrySlugs = new Set(registry.map((entry) => entry.slug));
const categoryStats = bucketProducts(products);
const errors = [];
const warnings = [];

for (const slug of requiredCategories) {
  if (!categoryStats[slug]?.productCount) {
    errors.push(`missing required category in products.csv: ${slug}`);
  }
}

for (const product of products) {
  if (!registrySlugs.has(product.category)) {
    errors.push(`products.csv line ${product.rowNumber}: unknown category ${product.category}`);
  }

  if (!product.image_url?.trim()) {
    warnings.push(`products.csv line ${product.rowNumber}: missing image_url for ${product.slug}`);
    continue;
  }

  if (isPlaceholderImage(product.image_url)) {
    continue;
  }

  if (!isValidImageUrl(product.image_url)) {
    errors.push(`products.csv line ${product.rowNumber}: invalid image_url ${product.image_url}`);
    continue;
  }

  if (product.image_url.startsWith("/") && !fileExistsForPublicUrl(product.image_url)) {
    errors.push(`products.csv line ${product.rowNumber}: missing local asset ${product.image_url}`);
  }
}

for (const file of uiFilesThatShouldUseRegistry) {
  const content = fs.readFileSync(path.join(root, file), "utf8");
  for (const slug of registrySlugs) {
    if (content.includes(`/category/${slug}`)) {
      errors.push(`${file} hardcodes /category/${slug}; use catalog registry instead`);
    }
  }
}

const currentBaseline = {
  generatedAt: new Date().toISOString(),
  categories: Object.fromEntries(
    registry.map((entry) => [
      entry.slug,
      {
        productCount: categoryStats[entry.slug]?.productCount ?? 0,
        realImageCount: categoryStats[entry.slug]?.realImageCount ?? 0,
        placeholderImageCount: categoryStats[entry.slug]?.placeholderImageCount ?? 0,
        missingImageCount: categoryStats[entry.slug]?.missingImageCount ?? 0,
      },
    ]),
  ),
};

if (writeBaseline) {
  fs.writeFileSync(baselineFile, JSON.stringify(currentBaseline, null, 2) + "\n");
  console.log(`Wrote baseline ${baselineFile}`);
  process.exit(0);
}

if (fs.existsSync(baselineFile)) {
  const baseline = JSON.parse(fs.readFileSync(baselineFile, "utf8"));
  for (const [slug, metrics] of Object.entries(baseline.categories ?? {})) {
    const current = currentBaseline.categories[slug] ?? { productCount: 0, realImageCount: 0 };
    if (current.productCount < metrics.productCount) {
      errors.push(`${slug}: product count dropped from ${metrics.productCount} to ${current.productCount}`);
    }
    if (current.realImageCount < metrics.realImageCount) {
      errors.push(`${slug}: real image count dropped from ${metrics.realImageCount} to ${current.realImageCount}`);
    }
    if (current.placeholderImageCount > (metrics.placeholderImageCount ?? 0)) {
      errors.push(`${slug}: placeholder image count increased from ${metrics.placeholderImageCount ?? 0} to ${current.placeholderImageCount}`);
    }
    if (current.missingImageCount > (metrics.missingImageCount ?? 0)) {
      errors.push(`${slug}: missing image count increased from ${metrics.missingImageCount ?? 0} to ${current.missingImageCount}`);
    }
  }
}

const summary = Object.entries(currentBaseline.categories)
  .map(([slug, metrics]) => `${slug}: ${metrics.productCount} products, ${metrics.realImageCount} real images, ${metrics.placeholderImageCount} placeholders`)
  .join("\n");

if (warnings.length) {
  console.warn(`Catalog doctor warnings (${warnings.length}):\n- ${warnings.join("\n- ")}\n`);
}

if (errors.length) {
  console.error(`Catalog doctor failed (${errors.length}):\n- ${errors.join("\n- ")}\n\nCurrent catalog snapshot:\n${summary}`);
  process.exit(1);
}

console.log(`Catalog doctor passed.\n${summary}`);
