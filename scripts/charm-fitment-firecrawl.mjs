import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import {
  mkdir,
  readFile,
  writeFile,
  access,
} from 'node:fs/promises';
import path from 'node:path';

const execFileAsync = promisify(execFile);

const TARGET_MAKES = [
  'Cadillac',
  'Chevrolet',
  'Chrysler',
  'Dodge and Ram',
  'Ford',
  'GMC',
  'Honda',
  'Hummer',
  'Hyundai',
  'Infiniti',
  'Jaguar',
  'Jeep',
  'Kia',
  'Land Rover',
  'Lexus',
  'Lincoln',
  'Mazda',
  'Mercedes Benz',
  'Mercury',
  'Mitsubishi',
  'Nissan-Datsun',
  'Oldsmobile',
  'Peugeot',
  'Plymouth',
  'Pontiac',
  'Volkswagen',
  'Volvo',
];

const DRIVE_TOKENS = new Set([
  '2WD', '4WD', 'AWD', 'FWD', 'RWD', '4X4', '4MATIC', 'QUATTRO', 'SYNCRO',
]);

const BODY_STYLE_PATTERNS = [
  /Crew Cab/i,
  /Extended Cab/i,
  /Club Cab/i,
  /Regular Cab/i,
  /SuperCab/i,
  /SuperCrew/i,
  /Cab & Chassis/i,
  /Chassis Cab/i,
  /Sedan/i,
  /Coupe/i,
  /Wagon/i,
  /Hatchback/i,
  /Convertible/i,
  /Roadster/i,
  /Van/i,
  /Minivan/i,
  /SUV/i,
  /Pickup/i,
];

const ENGINE_START_RE = /\b(?:[LVWHR]\d(?:-\d+cc)?|ELE-Electric(?:\s+Engine)?|Electric(?:\s+Engine)?|Fuel\s+Cell|DSL)\b/i;
const ENGINE_CODE_IN_PARENS_RE = /\(([^)]+)\)/;
const FUEL_NOTE_RE = /\b(Hybrid|Flex Fuel|Diesel|Turbo Diesel|Plug-In Hybrid|PHEV|CNG|L,DSL)\b/i;
const LINK_RE = /^\[(.+?)\]\((https?:\/\/[^)]+)\)$/;
const LIST_ITEM_RE = /^(\s*)-\s+(.*)$/;

function parseArgs(argv) {
  const options = {
    makes: TARGET_MAKES,
    yearStart: null,
    yearEnd: null,
    concurrency: 6,
    cacheDir: path.resolve('tmp/charm-fitment-cache'),
    outDir: path.resolve('data/charm-fitment'),
    force: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--make') {
      options.makes = [argv[++i]];
    } else if (arg === '--makes') {
      const raw = argv[++i];
      options.makes = raw === 'all' ? TARGET_MAKES : raw.split(',').map((s) => s.trim()).filter(Boolean);
    } else if (arg === '--year-start') {
      options.yearStart = Number(argv[++i]);
    } else if (arg === '--year-end') {
      options.yearEnd = Number(argv[++i]);
    } else if (arg === '--concurrency') {
      options.concurrency = Number(argv[++i]) || options.concurrency;
    } else if (arg === '--cache-dir') {
      options.cacheDir = path.resolve(argv[++i]);
    } else if (arg === '--out-dir') {
      options.outDir = path.resolve(argv[++i]);
    } else if (arg === '--force') {
      options.force = true;
    }
  }

  return options;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function scrapeToFile(url, outputPath, { force = false } = {}) {
  if (!force && await exists(outputPath)) {
    return { cached: true, outputPath };
  }

  await mkdir(path.dirname(outputPath), { recursive: true });

  let attempt = 0;
  let lastError;
  while (attempt < 3) {
    attempt += 1;
    try {
      await execFileAsync('firecrawl', ['scrape', '--format', 'markdown', '--output', outputPath, url], {
        cwd: process.cwd(),
        maxBuffer: 20 * 1024 * 1024,
      });
      return { cached: false, outputPath };
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 750 * attempt));
    }
  }

  throw lastError;
}

async function mapLimit(items, limit, iteratee) {
  const results = new Array(items.length);
  let index = 0;

  async function worker() {
    while (true) {
      const current = index;
      index += 1;
      if (current >= items.length) return;
      results[current] = await iteratee(items[current], current);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length || 1) }, () => worker()));
  return results;
}

function parseMarkdownList(markdown) {
  const items = [];
  for (const line of markdown.split(/\r?\n/)) {
    const match = line.match(LIST_ITEM_RE);
    if (!match) continue;
    const indent = match[1].length;
    const body = match[2].trim();
    const linkMatch = body.match(LINK_RE);
    items.push({
      depth: Math.floor(indent / 2),
      label: linkMatch ? linkMatch[1].trim() : body,
      url: linkMatch ? linkMatch[2].trim() : '',
    });
  }
  return items;
}

function buildLeafEntries(markdown) {
  const items = parseMarkdownList(markdown);
  const stack = [];
  const leaves = [];

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    const next = items[i + 1];
    const hasChildren = next ? next.depth > item.depth : false;

    stack.length = item.depth;
    const lineage = stack.map((entry) => entry.label);

    if (item.url && !hasChildren) {
      leaves.push({ label: item.label, url: item.url, lineage });
      continue;
    }

    stack[item.depth] = { label: item.label, url: item.url };
  }

  return leaves;
}

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function firstEngineIndex(text) {
  const match = text.match(ENGINE_START_RE);
  return match ? match.index : -1;
}

function extractFuelNote(text) {
  const notes = [];
  const matches = text.match(new RegExp(FUEL_NOTE_RE, 'gi')) || [];
  for (const note of matches) {
    const normalized = normalizeWhitespace(note);
    if (!notes.includes(normalized)) notes.push(normalized);
  }
  return notes.join(', ');
}

function splitModelAndVariant(text) {
  const clean = normalizeWhitespace(text);
  if (!clean) {
    return {
      model: '',
      variant: '',
      drivetrain: '',
      bodyStyle: '',
    };
  }

  const tokens = clean.split(' ');
  const variantTokens = [];

  while (tokens.length > 1) {
    const last = tokens[tokens.length - 1];
    if (!DRIVE_TOKENS.has(String(last).toUpperCase())) break;
    variantTokens.unshift(tokens.pop());
  }

  const bodyStyleMatches = BODY_STYLE_PATTERNS
    .map((pattern) => clean.match(pattern)?.[0] || '')
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
  const bodyStyle = bodyStyleMatches[0] || '';

  if (bodyStyle) {
    const bodyTokens = bodyStyle.split(' ');
    const remainingTail = tokens.slice(-bodyTokens.length).join(' ');
    if (tokens.length > bodyTokens.length && remainingTail.toLowerCase() === bodyStyle.toLowerCase()) {
      variantTokens.unshift(...tokens.splice(tokens.length - bodyTokens.length, bodyTokens.length));
    }
  }

  const model = normalizeWhitespace(tokens.join(' '));
  const variant = normalizeWhitespace(variantTokens.join(' '));
  const drivetrain = variantTokens.find((token) => DRIVE_TOKENS.has(String(token).toUpperCase())) || '';

  return { model, variant, drivetrain, bodyStyle };
}

function normalizeLeaf({ make, year, lineage, label, sourceUrl }) {
  const combinedSegments = [...lineage, label].map(normalizeWhitespace).filter(Boolean);
  const descriptor = normalizeWhitespace(combinedSegments.join(' '));
  const descriptorEngineIndex = firstEngineIndex(descriptor);

  let preEngine = descriptor;
  let engineDescriptor = '';

  if (descriptorEngineIndex >= 0) {
    preEngine = normalizeWhitespace(descriptor.slice(0, descriptorEngineIndex));
    engineDescriptor = normalizeWhitespace(descriptor.slice(descriptorEngineIndex));
  }

  const { model, variant, drivetrain, bodyStyle } = splitModelAndVariant(preEngine);
  const engineCode = engineDescriptor.match(ENGINE_CODE_IN_PARENS_RE)?.[1]?.trim() || '';
  const fuelNote = extractFuelNote(engineDescriptor);

  return {
    year: String(year),
    make,
    model,
    variant,
    drivetrain,
    bodyStyle,
    engine: engineDescriptor,
    engineCode,
    fuelNote,
    lineage,
    rawLabel: label,
    rawDescriptor: descriptor,
    sourceUrl,
  };
}

function buildIndexes(rows) {
  const years = [...new Set(rows.map((row) => row.year))].sort();
  const makes = [...new Set(rows.map((row) => row.make))].sort();
  const modelsByYearMake = {};
  const variantsByYearMakeModel = {};
  const enginesByYearMakeModelVariant = {};
  const fitmentTree = {};

  for (const row of rows) {
    modelsByYearMake[row.year] ??= {};
    variantsByYearMakeModel[row.year] ??= {};
    enginesByYearMakeModelVariant[row.year] ??= {};
    fitmentTree[row.year] ??= {};

    const makeModels = modelsByYearMake[row.year][row.make] ??= new Set();
    makeModels.add(row.model);

    const modelKey = `${row.make}|||${row.model}`;
    const modelVariants = variantsByYearMakeModel[row.year][modelKey] ??= new Set();
    modelVariants.add(row.variant || 'Base');

    const engineKey = `${row.make}|||${row.model}|||${row.variant || 'Base'}`;
    const engineSet = enginesByYearMakeModelVariant[row.year][engineKey] ??= new Set();
    engineSet.add(row.engine || 'Unknown');

    const yearNode = fitmentTree[row.year];
    const makeNode = yearNode[row.make] ??= {};
    const modelNode = makeNode[row.model] ??= {};
    const variantNode = modelNode[row.variant || 'Base'] ??= [];
    variantNode.push({
      engine: row.engine,
      engineCode: row.engineCode,
      fuelNote: row.fuelNote,
      drivetrain: row.drivetrain,
      bodyStyle: row.bodyStyle,
      sourceUrl: row.sourceUrl,
      rawDescriptor: row.rawDescriptor,
    });
  }

  const sortObjectArrays = (value) => Object.fromEntries(
    Object.entries(value).map(([key, nested]) => [
      key,
      Object.fromEntries(
        Object.entries(nested).map(([nestedKey, set]) => [nestedKey, [...set].sort()]),
      ),
    ]),
  );

  return {
    years,
    makes,
    modelsByYearMake: sortObjectArrays(modelsByYearMake),
    variantsByYearMakeModel: sortObjectArrays(variantsByYearMakeModel),
    enginesByYearMakeModelVariant: sortObjectArrays(enginesByYearMakeModelVariant),
    fitmentTree,
  };
}

function csvEscape(value) {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function toCsv(rows) {
  const headers = [
    'year',
    'make',
    'model',
    'variant',
    'drivetrain',
    'bodyStyle',
    'engine',
    'engineCode',
    'fuelNote',
    'sourceUrl',
    'rawDescriptor',
    'lineage',
  ];

  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((header) => {
      const value = header === 'lineage' ? row.lineage.join(' > ') : row[header];
      return csvEscape(value);
    }).join(','));
  }
  return `${lines.join('\n')}\n`;
}

async function readMarkdown(filePath) {
  return readFile(filePath, 'utf8');
}

async function writeOutputs({ options, perMake, scrapeFailures, rows }) {
  const sortedRows = [...rows].sort((a, b) => {
    return Number(a.year) - Number(b.year)
      || a.make.localeCompare(b.make)
      || a.model.localeCompare(b.model)
      || a.variant.localeCompare(b.variant)
      || a.engine.localeCompare(b.engine);
  });

  const indexes = buildIndexes(sortedRows);
  const generatedAt = new Date().toISOString();
  const coverage = {
    requestedMakes: options.makes.length,
    completedMakes: perMake.filter((entry) => !entry.failed && entry.scrapedYears > 0).length,
    rows: sortedRows.length,
    yearsCovered: indexes.years.length,
    failedRequests: scrapeFailures.length,
  };

  const metadata = {
    generatedAt,
    source: 'https://charm.li/',
    requestedMakes: options.makes,
    yearStart: options.yearStart,
    yearEnd: options.yearEnd,
    cacheDir: path.relative(process.cwd(), options.cacheDir),
    caveats: [
      'Charm labels are inconsistent across years; model and variant are heuristic splits from the raw descriptor.',
      'Nested list parents are preserved in lineage and rawDescriptor so future normalization can be improved without re-scraping.',
      'Some engine descriptors only expose displacement/code fragments, so engineCode may be blank when Charm does not use parentheses.',
    ],
  };

  const rowsPath = path.join(options.outDir, 'charm-fitment-rows.json');
  const treePath = path.join(options.outDir, 'charm-fitment-tree.json');
  const csvPath = path.join(options.outDir, 'charm-fitment.csv');
  const summaryPath = path.join(options.outDir, 'charm-fitment-summary.json');

  await writeFile(rowsPath, JSON.stringify({ metadata, coverage, perMake, rows: sortedRows }, null, 2));
  await writeFile(treePath, JSON.stringify({ metadata, coverage, perMake, ...indexes }, null, 2));
  await writeFile(csvPath, toCsv(sortedRows));
  await writeFile(summaryPath, JSON.stringify({ metadata, coverage, perMake, scrapeFailures }, null, 2));

  return {
    metadata,
    coverage,
    perMake,
    outputs: {
      rowsPath,
      treePath,
      csvPath,
      summaryPath,
    },
    scrapeFailures,
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  await mkdir(options.cacheDir, { recursive: true });
  await mkdir(options.outDir, { recursive: true });

  const perMake = [];
  const scrapeFailures = [];
  const rows = [];

  for (const make of options.makes) {
    console.log(`[charm-fitment] starting make: ${make}`);
    const makeSlug = slugify(make);
    const makeDir = path.join(options.cacheDir, makeSlug);
    const makePath = path.join(makeDir, 'make.md');
    const makeUrl = `https://charm.li/${encodeURIComponent(make)}/`;

    try {
      await scrapeToFile(makeUrl, makePath, { force: options.force });
      const makeMarkdown = await readMarkdown(makePath);
      const years = buildLeafEntries(makeMarkdown)
        .map((entry) => Number(entry.label))
        .filter((year) => Number.isInteger(year))
        .filter((year) => (options.yearStart ? year >= options.yearStart : true))
        .filter((year) => (options.yearEnd ? year <= options.yearEnd : true));

      const yearJobs = years.map((year) => ({ make, makeSlug, year }));
      const results = await mapLimit(yearJobs, options.concurrency, async ({ make: jobMake, makeSlug: jobMakeSlug, year }) => {
        const yearUrl = `https://charm.li/${encodeURIComponent(jobMake)}/${year}/`;
        const yearPath = path.join(options.cacheDir, jobMakeSlug, `${year}.md`);

        try {
          await scrapeToFile(yearUrl, yearPath, { force: options.force });
          const yearMarkdown = await readMarkdown(yearPath);
          const leaves = buildLeafEntries(yearMarkdown)
            .filter((entry) => entry.url.includes(`/${encodeURIComponent(jobMake).replace(/%20/g, ' ')}`) || entry.url.includes(`/${jobMake}/`) || entry.url.includes(`/${encodeURIComponent(jobMake)}/`))
            .map((entry) => normalizeLeaf({
              make: jobMake,
              year,
              lineage: entry.lineage,
              label: entry.label,
              sourceUrl: entry.url,
            }))
            .filter((entry) => entry.model || entry.engine);

          return { make: jobMake, year, rowCount: leaves.length, rows: leaves };
        } catch (error) {
          scrapeFailures.push({ make: jobMake, year, error: String(error?.message || error) });
          return { make: jobMake, year, rowCount: 0, rows: [], failed: true };
        }
      });

      const yearCounts = {};
      for (const result of results) {
        yearCounts[result.year] = result.rowCount;
        rows.push(...result.rows);
      }

      const makeSummary = {
        make,
        years,
        scrapedYears: results.filter((result) => !result.failed).length,
        failedYears: results.filter((result) => result.failed).map((result) => result.year),
        rowCount: results.reduce((sum, result) => sum + result.rowCount, 0),
        yearCounts,
      };
      perMake.push(makeSummary);
      await writeOutputs({ options, perMake, scrapeFailures, rows });
      console.log(`[charm-fitment] finished make: ${make} (${makeSummary.scrapedYears} years, ${makeSummary.rowCount} rows)`);
    } catch (error) {
      scrapeFailures.push({ make, year: null, error: String(error?.message || error) });
      perMake.push({ make, years: [], scrapedYears: 0, failedYears: [], rowCount: 0, yearCounts: {}, failed: true });
      await writeOutputs({ options, perMake, scrapeFailures, rows });
      console.log(`[charm-fitment] failed make: ${make}`);
    }
  }

  const output = await writeOutputs({ options, perMake, scrapeFailures, rows });
  console.log(JSON.stringify({
    ...output,
    scrapeFailures: output.scrapeFailures.slice(0, 20),
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
