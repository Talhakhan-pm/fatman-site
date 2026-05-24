import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);

function loadTsModule(relativePath) {
  const filename = path.resolve(relativePath);
  const source = fs.readFileSync(filename, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
    fileName: filename,
  }).outputText;

  const testModule = { exports: {} };
  const context = {
    module: testModule,
    exports: testModule.exports,
    require,
    console,
  };
  vm.runInNewContext(compiled, context, { filename });
  return testModule.exports;
}

const display = loadTsModule("src/lib/category-display.ts");

test("humanizes imported leaf category slugs for compatible category cards", () => {
  assert.equal(
    display.humanizeCategorySlug("transmission-and-drivetrain-automatic-transmission-transaxle-clutch-forward-clutch"),
    "Forward Clutch",
  );
  assert.equal(
    display.humanizeCategorySlug("engine-cooling-and-exhaust-engine-engine-mount"),
    "Engine Mount",
  );
});

test("chooses stable icons from imported category slug prefixes", () => {
  assert.equal(
    display.getIconForCategorySlug("transmission-and-drivetrain-automatic-transmission-transaxle-clutch-forward-clutch"),
    "transmission",
  );
  assert.equal(
    display.getIconForCategorySlug("brakes-and-traction-control-hydraulic-system-brake-hose-line"),
    "brake",
  );
  assert.equal(
    display.getIconForCategorySlug("engine-cooling-and-exhaust-engine-engine-mount"),
    "engine",
  );
});
