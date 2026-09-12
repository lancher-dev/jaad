import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { mkdtempSync } from "node:fs";
import {
  createSitemapFilter,
  findOpeningPages,
  getInjectedRoutes,
  shouldInjectNotFound,
} from "../../packages/jaad/src/integration.ts";

test("opening-page discovery follows collection slugging and numeric order", () => {
  const docsDir = mkdtempSync(join(tmpdir(), "jaad-opening-"));
  try {
    mkdirSync(join(docsDir, "02-guides"));
    writeFileSync(join(docsDir, "01-images-&-videos.md"), "# Images");
    writeFileSync(join(docsDir, "02-guides", "01-setup.md"), "# Setup");

    assert.deepEqual(findOpeningPages(docsDir), [
      { locale: undefined, slug: "images--videos" },
    ]);
  } finally {
    rmSync(docsDir, { recursive: true });
  }
});

// The opening page is whatever the collection sorts first, and the sitemap
// filter has to agree with it or it drops the wrong url.
test("a draft never counts as the opening page", () => {
  const docsDir = mkdtempSync(join(tmpdir(), "jaad-opening-draft-"));
  try {
    writeFileSync(
      join(docsDir, "00-scratch.md"),
      "---\ndraft: true\n---\n\n# Scratch",
    );
    writeFileSync(join(docsDir, "01-intro.md"), "# Intro");

    assert.deepEqual(findOpeningPages(docsDir), [
      { locale: undefined, slug: "intro" },
    ]);
  } finally {
    rmSync(docsDir, { recursive: true });
  }
});

test("frontmatter order moves the opening page", () => {
  const docsDir = mkdtempSync(join(tmpdir(), "jaad-opening-order-"));
  try {
    writeFileSync(join(docsDir, "01-intro.md"), "# Intro");
    writeFileSync(
      join(docsDir, "02-welcome.md"),
      "---\norder: 0\n---\n\n# Welcome",
    );

    assert.deepEqual(findOpeningPages(docsDir), [
      { locale: undefined, slug: "welcome" },
    ]);
  } finally {
    rmSync(docsDir, { recursive: true });
  }
});

test("the sitemap omits only the opening page's named redirect", () => {
  const filter = createSitemapFilter("/docs", {
    deploymentBase: "/repo",
    openingPages: [{ slug: "images--videos" }],
  });

  assert.equal(filter("https://example.dev/repo/docs/images--videos/"), false);
  assert.equal(filter("https://example.dev/repo/docs/"), true);
  assert.equal(filter("https://example.dev/repo/docs/guide/"), true);
});

// ── One opening page per locale ──────────────────────────────────────────────

test("each locale gets its own opening page", () => {
  const docsDir = mkdtempSync(join(tmpdir(), "jaad-opening-i18n-"));
  try {
    mkdirSync(join(docsDir, "en"));
    mkdirSync(join(docsDir, "it"));
    writeFileSync(join(docsDir, "en", "01-intro.md"), "# Intro");
    writeFileSync(join(docsDir, "en", "02-guide.md"), "# Guide");
    writeFileSync(join(docsDir, "it", "01-introduzione.md"), "# Introduzione");

    assert.deepEqual(findOpeningPages(docsDir, ["en", "it"]), [
      { locale: "en", slug: "intro" },
      { locale: "it", slug: "introduzione" },
    ]);
  } finally {
    rmSync(docsDir, { recursive: true });
  }
});

test("the sitemap omits the named redirect of every locale", () => {
  const filter = createSitemapFilter(
    "",
    {
      deploymentBase: "",
      openingPages: [
        { locale: "en", slug: "intro" },
        { locale: "it", slug: "introduzione" },
      ],
    },
    "en",
  );

  assert.equal(filter("https://example.dev/intro/"), false);
  assert.equal(filter("https://example.dev/it/introduzione/"), false);
  assert.equal(filter("https://example.dev/it/"), true);
  assert.equal(filter("https://example.dev/guide/"), true);
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

// The rest param already absorbs "it/guide": only the fixed endpoints fan out.
test("a localised site adds one route per fixed endpoint, not per locale", () => {
  assert.deepEqual(
    getInjectedRoutes("/docs", ["it", "fr"]).map(([pattern]) => pattern),
    [
      "/docs",
      "/docs/search-index.json",
      "/docs/llms.txt",
      "/docs/[locale]/search-index.json",
      "/docs/[locale]/llms.txt",
      "/docs/[...slug]",
      "/docs/[...slug].md",
    ],
  );
});
