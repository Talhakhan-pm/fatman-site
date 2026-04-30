import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const make = 'Toyota';
const yearStart = 1982;
const yearEnd = 2013;
const outDir = path.resolve('tmp/charm-toyota');
mkdirSync(outDir, { recursive: true });

function scrape(url) {
  const output = execFileSync('firecrawl', ['scrape', url], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  });
  return output;
}

function extractLinks(markdown) {
  const links = [];
  const re = /^- \[(.+?)\]\((https?:\/\/[^)]+)\)$/gm;
  let m;
  while ((m = re.exec(markdown)) !== null) {
    links.push({ label: m[1].trim(), url: m[2].trim() });
  }
  return links;
}

function parseLeaf(label, year) {
  const text = label.trim();
  const engineMatch = text.match(/\b([A-Z0-9]+-[0-9.]+L|ELE-Electric Engine)\s*\(([^)]+)\)(?:\s+(Hybrid|Flex Fuel))?$/i);

  let engine = '';
  let engineCode = '';
  let fuelNote = '';
  let prefix = text;

  if (engineMatch) {
    engine = engineMatch[1].trim();
    engineCode = engineMatch[2].trim();
    fuelNote = engineMatch[3]?.trim() || '';
    prefix = text.slice(0, engineMatch.index).trim();
  }

  const tokens = prefix.split(/\s+/).filter(Boolean);
  const variantTokens = [];
  while (tokens.length) {
    const last = tokens[tokens.length - 1];
    if (/^(2WD|4WD|AWD|FWD|RWD|PreRunner|Sedan|Hatchback|Coupe|Wagon|Van)$/i.test(last)) {
      variantTokens.unshift(tokens.pop());
      continue;
    }
    break;
  }

  const model = tokens.join(' ').trim();
  const variant = variantTokens.join(' ').trim();

  return {
    year: String(year),
    make,
    model,
    variant,
    engine,
    engineCode,
    fuelNote,
    rawLabel: label,
  };
}

const years = [];
const makeMarkdown = scrape(`https://charm.li/${encodeURIComponent(make)}/`);
writeFileSync(path.join(outDir, 'make.md'), makeMarkdown);
for (const link of extractLinks(makeMarkdown)) {
  if (/^\d{4}$/.test(link.label)) years.push(Number(link.label));
}

const selectedYears = years.filter((y) => y >= yearStart && y <= yearEnd);
const vehicles = [];

for (const year of selectedYears) {
  const yearMarkdown = scrape(`https://charm.li/${encodeURIComponent(make)}/${year}/`);
  writeFileSync(path.join(outDir, `${year}.md`), yearMarkdown);
  const links = extractLinks(yearMarkdown);
  for (const link of links) {
    if (!link.url.includes(`/${make}/${year}/`)) continue;
    vehicles.push({
      ...parseLeaf(link.label, year),
      sourceUrl: link.url,
    });
  }
}

const models = [...new Set(vehicles.map((v) => v.model).filter(Boolean))].sort();
const variants = [...new Set(vehicles.map((v) => v.variant).filter(Boolean))].sort();
const engines = [...new Set(vehicles.map((v) => v.engine).filter(Boolean))].sort();

const payload = {
  generatedAt: new Date().toISOString(),
  source: 'https://charm.li/',
  make,
  years: selectedYears,
  counts: {
    vehicles: vehicles.length,
    models: models.length,
    variants: variants.length,
    engines: engines.length,
  },
  models,
  variants,
  engines,
  vehicles,
};

writeFileSync(path.join(outDir, 'toyota-charm-fitment.json'), JSON.stringify(payload, null, 2));
console.log(JSON.stringify({
  outDir,
  years: selectedYears.length,
  vehicles: vehicles.length,
  models: models.length,
  variants: variants.length,
  engines: engines.length,
  sample: vehicles.slice(0, 8),
}, null, 2));
