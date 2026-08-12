import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const DIST = join(ROOT, "www", "dist");

export function walk(dir) {
  return readdirSync(dir).flatMap((e) => {
    const p = join(dir, e);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

/** Reading a page that isn't there must fail loudly, not assert on "". */
export function page(relative) {
  const file = join(DIST, relative);
  if (!existsSync(file)) {
    throw new Error(`built page missing: ${relative} — run the build first`);
  }
  return readFileSync(file, "utf8");
}

export function distFiles(ext) {
  return walk(DIST).filter((f) => f.endsWith(ext));
}
