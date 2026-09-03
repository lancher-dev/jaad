import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdtempSync } from "node:fs";
import {
  createSitemapFilter,
  findOpeningDocSlug,
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
