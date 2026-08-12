import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { allCss } from "../dist.mjs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SRC = join(ROOT, "packages", "jaad", "src");
const DIST = join(ROOT, "www", "dist");

const walk = (dir) =>
  readdirSync(dir).flatMap((e) => {
    const p = join(dir, e);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

/** Tailwind escapes these when it emits the selector. */
const escape = (cls) => cls.replace(/[.:/[\]%()!,#]/g, (c) => "\\" + c);

test("every utility used by the package ships in the built CSS", () => {
  const css = allCss();

  const classes = new Set();
  for (const file of walk(SRC).filter((f) => f.endsWith(".astro"))) {
    for (const m of readFileSync(file, "utf8").matchAll(
      /\bclass(?:Name)?="([^"{}]+)"/g,
    )) {
      for (const token of m[1].split(/\s+/)) if (token) classes.add(token);
    }
  }

  assert.ok(classes.size > 0, "no classes found — did the source move?");

  const missing = [...classes].filter((c) => !css.includes("." + escape(c)));
  assert.deepEqual(
    missing.sort(),
    [],
    "Tailwind never scans node_modules; the package CSS needs an @source pointing at its own sources",
  );
});
