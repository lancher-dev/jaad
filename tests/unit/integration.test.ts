import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { mkdtempSync } from "node:fs";
import {
  createSitemapFilter,
  findOpeningDocSlug,
  getInjectedRoutes,
  shouldInjectNotFound,
} from "../../packages/jaad/src/integration.ts";

test("opening-page discovery follows collection slugging and numeric order", () => {
  const docsDir = mkdtempSync(join(tmpdir(), "jaad-opening-"));
  try {
    mkdirSync(join(docsDir, "02-guides"));
    writeFileSync(join(docsDir, "01-images-&-videos.md"), "# Images");
    writeFileSync(join(docsDir, "02-guides", "01-setup.md"), "# Setup");

    assert.equal(findOpeningDocSlug(docsDir), "images--videos");
  } finally {
    rmSync(docsDir, { recursive: true });
  }
});

test("the sitemap omits only the opening page's named redirect", () => {
  const filter = createSitemapFilter("/docs", {
    deploymentBase: "/repo",
    openingSlug: "images--videos",
  });

  assert.equal(filter("https://example.dev/repo/docs/images--videos/"), false);
  assert.equal(filter("https://example.dev/repo/docs/"), true);
  assert.equal(filter("https://example.dev/repo/docs/guide/"), true);
});

test("the fallback 404 belongs only to a docs-only site", () => {
  const root = mkdtempSync(join(tmpdir(), "jaad-404-"));
  const srcDir = pathToFileURL(`${root}/`);

  try {
    assert.equal(shouldInjectNotFound("", srcDir), true);
    assert.equal(shouldInjectNotFound("/docs", srcDir), false);

    mkdirSync(join(root, "pages"));
    writeFileSync(join(root, "pages", "404.astro"), "<h1>Mine</h1>");
    assert.equal(shouldInjectNotFound("", srcDir), false);
  } finally {
    rmSync(root, { recursive: true });
  }
});

test("technical routes stay inside the documentation mount", () => {
  assert.deepEqual(
    getInjectedRoutes("/docs").map(([pattern]) => pattern),
    [
      "/docs",
      "/docs/search-index.json",
      "/docs/llms.txt",
      "/docs/[...slug]",
      "/docs/[...slug].md",
    ],
  );
  assert.deepEqual(
    getInjectedRoutes("").map(([pattern]) => pattern),
    ["", "/search-index.json", "/llms.txt", "/[...slug]", "/[...slug].md"],
  );
});
