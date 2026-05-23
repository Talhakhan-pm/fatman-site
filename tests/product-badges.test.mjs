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

const badges = loadTsModule("src/lib/product-badges.ts");

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

test("normalizes allowed product badge metadata and rejects junk", () => {
  assert.equal(badges.normalizeProductCondition("new"), "new");
  assert.equal(badges.normalizeProductCondition("USED"), "used");
  assert.equal(badges.normalizeProductCondition("remanufactured"), "remanufactured");
  assert.equal(badges.normalizeProductCondition("takeoff"), undefined);

  assert.equal(badges.normalizeProductPartSource("oem"), "oem");
  assert.equal(badges.normalizeProductPartSource("Aftermarket"), "aftermarket");
  assert.equal(badges.normalizeProductPartSource("dealer"), undefined);
});

test("extracts condition and source badges from products.metadata", () => {
  assert.deepEqual(
    plain(badges.getProductBadgeMetadata({ metadata: { condition: "used", partSource: "oem" } })),
    { condition: "used", partSource: "oem" },
  );

  assert.deepEqual(
    plain(badges.getProductBadgeMetadata({ metadata: { condition: "bad", partSource: "dealer" } })),
    {},
  );
});

test("merges badge metadata without losing unrelated metadata", () => {
  assert.deepEqual(
    plain(badges.mergeProductBadgeMetadata(
      { sourceCategoryPath: "Engine > Cooling", condition: "used" },
      { condition: "new", partSource: "aftermarket" },
    )),
    { sourceCategoryPath: "Engine > Cooling", condition: "new", partSource: "aftermarket" },
  );

  assert.deepEqual(
    plain(badges.mergeProductBadgeMetadata({ sourceCategoryPath: "Engine" }, { condition: "", partSource: "" })),
    { sourceCategoryPath: "Engine" },
  );
});

test("builds display badge labels in storefront order", () => {
  assert.deepEqual(
    plain(badges.getProductDisplayBadges({ condition: "used", partSource: "oem" })),
    [
      { kind: "condition", value: "used", label: "Used" },
      { kind: "partSource", value: "oem", label: "OEM" },
    ],
  );
});
