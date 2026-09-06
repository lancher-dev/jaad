import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** Every `color-mix` token, as [name, formula] with the prefix normalised. */
function derivedTokens(file: string): [string, string][] {
  const source = readFileSync(join(ROOT, file), "utf8");
  return [
    ...source.matchAll(
      /--(?:color|identity)-([a-z-]+):\s*(color-mix\([^;]*\))/g,
    ),
  ].map((match) => [
    match[1],
    match[2].replace(/\s+/g, " ").replace(/--(?:color|identity)-/g, "--"),
  ]);
}

// The official site keeps its own palette and maps it onto both surfaces, so
// nothing forces the two recipes to agree. If they drift, jaad.lancher.dev
// stops showing what a default installation looks like.
test("the site derives its palette the way the package does", () => {
  const shipped = derivedTokens("packages/jaad/src/styles/global.css");
  const site = derivedTokens("www/src/styles/identity.css");

  assert.ok(shipped.length > 0, "no derived tokens found in the package");
  assert.deepEqual(site, shipped);
});
