import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { walk } from "../dist.mjs";
import {
  cleanupTemporaryDirectories,
  packPackage,
  run,
  temporaryDirectory,
} from "./helpers.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PKG = join(HERE, "..", "..", "packages", "jaad");

// pnpm: strict layout, so tailwind.css must reach the site's tailwindcss as a peer.
describe("`tailwind: true` in a pnpm project", () => {
  let project;
  let missing;
  let css;

  before(() => {
    const tarball = packPackage(PKG);
    project = temporaryDirectory("jaad-tailwind-");
    cpSync(join(HERE, "fixture"), project, { recursive: true });
    writeFileSync(
      join(project, "package.json"),
      JSON.stringify({
        name: "tailwind-test",
        private: true,
        type: "module",
        dependencies: { astro: "7.3.1", "@lancher-dev/jaad": tarball },
      }),
    );
    writeFileSync(
      join(project, "pnpm-workspace.yaml"),
      "allowBuilds:\n  esbuild: true\n",
    );
    writeFileSync(
      join(project, "jaad.config.ts"),
      `import { defineJaadConfig } from "@lancher-dev/jaad";
export default defineJaadConfig({
  title: "T",
  routeBase: "/docs",
  tailwind: true,
  astro: { vite: { build: { cssMinify: false } } },
});
`,
    );
    writeFileSync(
      join(project, "src", "pages", "index.astro"),
      `---
import Page from "@lancher-dev/jaad/layouts/Page.astro";
---
<Page><p class="max-w-200 bg-surface dark:text-primary">x</p></Page>
`,
    );

    run("pnpm", ["install", "--config.minimum-release-age=0"], project);
    try {
      run("pnpm", ["exec", "astro", "build"], project);
    } catch (error) {
      missing = error.message;
    }

    run(
      "pnpm",
      [
        "add",
        "-D",
        "--config.minimum-release-age=0",
        "tailwindcss@^4",
        "@tailwindcss/vite@^4",
      ],
      project,
    );
    run("pnpm", ["exec", "astro", "build"], project);
    css = walk(join(project, "dist"))
      .filter((f) => f.endsWith(".css"))
      .map((f) => readFileSync(f, "utf8"))
      .join("\n");
  });

  after(cleanupTemporaryDirectories);

  test("without tailwind installed, the build names what to install", () => {
    assert.match(missing ?? "", /npm i -D tailwindcss @tailwindcss\/vite/);
  });

  test("site utilities are generated against JAAD's tokens", () => {
    assert.match(css, /\.max-w-200\s*\{/);
    assert.match(
      css,
      /\.bg-surface\s*\{\s*background-color:\s*var\(--color-surface/,
    );
  });

  test("utilities in a custom DocsFrame are generated too", () => {
    assert.match(css, /\.lg\\:ml-64/);
  });

  test("dark: follows JAAD's .dark class, not the media query", () => {
    assert.match(css, /dark\\:text-primary/);
    assert.match(css, /:where\(\.dark,\s?\.dark \*\)/);
    assert.doesNotMatch(css, /prefers-color-scheme:\s*dark/);
  });

  test("no second preflight", () => {
    const preflight = /::backdrop,\s*::file-selector-button\s*\{/g;
    assert.equal(css.match(preflight)?.length, 1);
  });
});
