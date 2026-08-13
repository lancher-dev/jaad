import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { defineJaadSite } from "./index.ts";
import type { JaadUserConfig } from "./src/config.ts";

const CANDIDATES = ["jaad.config.ts", "jaad.config.mjs", "jaad.config.js"];

const file = CANDIDATES.map((n) => join(process.cwd(), n)).find(existsSync);
if (!file) {
  throw new Error(
    `jaad: no config found. Create one of ${CANDIDATES.join(", ")} in the project root.`,
  );
}

// The path is only known at runtime, which is the point: Vite cannot analyse it
// and would warn on every dev server and every build.
const loaded = (await import(/* @vite-ignore */ pathToFileURL(file).href)) as {
  default: JaadUserConfig;
};

export default defineJaadSite(loaded.default);
