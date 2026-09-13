import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { allCss, packageClasses, missingFrom } from "../dist.mjs";

const SRC = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../packages/jaad/src",
);

test("every utility used by the package ships in the built CSS", () => {
  const classes = packageClasses(SRC);
  assert.ok(classes.size > 0, "no classes found; did the source move?");

  assert.deepEqual(
    missingFrom(allCss(), classes),
    [],
    "Tailwind never scans node_modules; the package CSS needs an @source pointing at its own sources",
  );
});

// An unlayered rule beats every Tailwind utility, including the consumer's own.
test("the package styles no bare element outside a cascade layer", () => {
  const css = allCss();

  // Layered rules are overridable; keyframe steps only look like selectors.
  const spans = [];
  for (const m of css.matchAll(/@(?:layer|keyframes)\s+[a-zA-Z-]+\s*\{/g)) {
    let depth = 0;
    for (let i = m.index + m[0].length - 1; i < css.length; i++) {
      if (css[i] === "{") depth++;
      else if (css[i] === "}" && --depth === 0) {
        spans.push([m.index, i]);
        break;
      }
    }
  }
  const layered = (at) => spans.some(([a, b]) => at >= a && at <= b);

  const offenders = [];
  for (const m of css.matchAll(/(^|[{}])\s*([a-z][a-z0-9,\s]*?)\s*\{/gi)) {
    const at = m.index + m[0].indexOf(m[2]);
    if (layered(at)) continue;
    const selectors = m[2].split(",").map((s) => s.trim());
    if (selectors.every((s) => /^(html|body)$/.test(s))) continue;
    offenders.push(m[2].replace(/\s+/g, " "));
  }

  assert.deepEqual([...new Set(offenders)], []);
});

// The bare-element check above reads the bundle, where a class selector is
// indistinguishable from a utility. docs.css went unlayered for a whole release
// because of that, outranking every utility a consumer writes on a .docs-* box.
test("the documentation stylesheet is layered as a whole", () => {
  const source = readFileSync(join(SRC, "styles/docs.css"), "utf8");

  const outside = source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/@layer[^{]*\{[\s\S]*\n\}/, "")
    .trim();

  assert.equal(outside, "", "these rules sit outside @layer");
});
