import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseDocCollectionId,
  sortDocPages,
  getCleanSlug,
  getDocCollectionId,
  getCanonicalDocSlug,
  slugToTitle,
  formatChapterTitle,
  extractTitleFromMarkdown,
  extractHeadingsFromMarkdown,
  stripMarkdown,
  extractDescription,
  docTitle,
  docLabel,
  docOrder,
  splitDocLocale,
  routedId,
  buildSearchIndex,
  validateDocsStructure,
} from "../../packages/jaad/src/utils/docs.ts";
import { buildDocsNavigation } from "../../packages/jaad/src/navigation.ts";

const navigationItems = (navigation: ReturnType<typeof buildDocsNavigation>) =>
  navigation.sections.flatMap((section) =>
    section.type === "page" ? [section.item] : section.items,
  );

// ── Numeric prefixes: the ordering convention the whole product rests on ──────

test("a numeric prefix sets the order and is stripped from the slug", () => {
  const parsed = parseDocCollectionId("01-introduction");
  assert.equal(parsed.order, 1);
  assert.equal(parsed.slug, "introduction");
  assert.equal(parsed.title, "Introduction");
  assert.equal(parsed.chapter, undefined);
});

test("a nested page carries both its chapter's order and its own", () => {
  const parsed = parseDocCollectionId("02-guides/03-advanced");
  assert.equal(parsed.orderChapter, 2);
  assert.equal(parsed.chapter, "guides");
  assert.equal(parsed.order, 3);
  assert.equal(parsed.slug, "advanced");
});

test("an unnumbered page sorts last", () => {
  assert.equal(parseDocCollectionId("about").order, 999);
});

test("an unnumbered directory still names the chapter", () => {
  const parsed = parseDocCollectionId("guides/01-intro");
  assert.equal(parsed.chapter, "guides");
  assert.equal(parsed.orderChapter, undefined);
});

test("prefixes are stripped from every path segment", () => {
  assert.equal(getCleanSlug("02-guides/03-advanced"), "guides/advanced");
  assert.equal(getCleanSlug("00-overview"), "overview");
});

test("file paths use the same slug rules as the content collection", () => {
  assert.equal(
    getDocCollectionId("03-markdown/08-images-&-videos.md"),
    "03-markdown/08-images--videos",
  );
  assert.equal(
    getDocCollectionId("03-markdown\\10-detail-&-summary.md"),
    "03-markdown/10-detail--summary",
  );
});

test("only the first sorted page has an empty canonical slug", () => {
  const pages = [{ id: "01-intro" }, { id: "02-guide" }];
  assert.equal(getCanonicalDocSlug(pages[0], 0), "");
  assert.equal(getCanonicalDocSlug(pages[1], 1), "guide");
});

test("a flat tree or one chapter level has an unambiguous structure", () => {
  assert.doesNotThrow(() => {
    validateDocsStructure([
      { id: "01-intro" },
      { id: "02-guides/01-setup" },
      { id: "02-guides/02-deploy" },
    ]);
  });
});

test("duplicate clean slugs stop the build with both source ids", () => {
  assert.throws(
    () => {
      validateDocsStructure([{ id: "01-guide" }, { id: "02-guide" }]);
    },
    (error: Error) => {
      assert.match(error.message, /^jaad: invalid documentation structure\n/);
      assert.match(error.message, /01-guide, 02-guide all resolve to \/guide/);
      return true;
    },
  );
});

test("ambiguous chapters and unsupported depth are reported together", () => {
  assert.throws(
    () => {
      validateDocsStructure([
        { id: "01-guides/01-start" },
        { id: "guides/02-next" },
        { id: "03-api/01-client/01-create" },
      ]);
    },
    (error: Error) => {
      assert.match(
        error.message,
        /01-guides, guides all resolve to chapter \/guides/,
      );
      assert.match(
        error.message,
        /03-api\/01-client\/01-create: only one chapter directory is supported/,
      );
      return true;
    },
  );
});

// ── Sorting ──────────────────────────────────────────────────────────────────

test("chapters sort by directory prefix, pages by their own within a chapter", () => {
  const pages = [
    { id: "02-guides/02-second" },
    { id: "01-intro" },
    { id: "02-guides/01-first" },
    { id: "03-reference/01-api" },
  ];
  assert.deepEqual(
    sortDocPages([...pages]).map((p) => p.id),
    [
      "01-intro",
      "02-guides/01-first",
      "02-guides/02-second",
      "03-reference/01-api",
    ],
  );
});

test("a root page interleaves with chapters by its own number", () => {
  const pages = [
    { id: "03-later" },
    { id: "02-guides/01-first" },
    { id: "01-first" },
  ];
  assert.deepEqual(
    sortDocPages([...pages]).map((p) => p.id),
    ["01-first", "02-guides/01-first", "03-later"],
  );
});

// ── Titles ───────────────────────────────────────────────────────────────────

test("slugs become titles, preserving separators the filesystem mangles", () => {
  assert.equal(slugToTitle("getting-started"), "Getting Started");
  assert.equal(slugToTitle("images-&-videos"), "Images & Videos");
  assert.equal(slugToTitle("detail_%26_summary"), "Detail & Summary");
});

test("a chapter title is null when there is no chapter", () => {
  assert.equal(formatChapterTitle(undefined), null);
  assert.equal(formatChapterTitle("getting-started"), "Getting Started");
});

test("the first h1 wins as the page title", () => {
  assert.equal(
    extractTitleFromMarkdown("# Real Title\n\n# Later"),
    "Real Title",
  );
  assert.equal(extractTitleFromMarkdown("## Not an h1\n\ntext"), null);
  assert.equal(extractTitleFromMarkdown(""), null);
});

// ── Table of contents ────────────────────────────────────────────────────────

test("only h2 and h3 reach the table of contents", () => {
  const headings = extractHeadingsFromMarkdown(
    "# One\n## Two\n### Three\n#### Four",
  );
  assert.deepEqual(
    headings.map((h) => [h.depth, h.text]),
    [
      [2, "Two"],
      [3, "Three"],
    ],
  );
});

// The renderer numbers repeated ids; a stateless slug pointed every duplicate
// entry at the first heading.
test("repeated headings get the same suffixes the renderer gives them", () => {
  const headings = extractHeadingsFromMarkdown("## Setup\n## Setup\n### Setup");
  assert.deepEqual(
    headings.map((h) => h.slug),
    ["setup", "setup-1", "setup-2"],
  );
});

test("headings written inside a code sample are not table-of-contents entries", () => {
  const headings = extractHeadingsFromMarkdown(
    ["## Real", "```md", "## Example", "```", "## Also real"].join("\n"),
  );
  assert.deepEqual(
    headings.map((h) => h.text),
    ["Real", "Also real"],
  );
});

// ── Text extraction, which also feeds search and the update manifest ─────────

test("markdown syntax is stripped down to prose", () => {
  const stripped = stripMarkdown(
    "# Title\n\n**bold** and *italic* and `code`\n\n[link](https://x.dev)\n\n![alt](img.png)",
  );
  assert.ok(stripped.includes("bold and italic and code"));
  assert.ok(stripped.includes("link"));
  assert.ok(!stripped.includes("https://x.dev"));
  assert.ok(!stripped.includes("img.png"));
});

test("an image leaves neither its alt text nor a stray bang", () => {
  assert.equal(stripMarkdown("Look ![a diagram](/x.png) here."), "Look  here.");
  assert.equal(stripMarkdown("Empty ![](/x.png) alt."), "Empty  alt.");
});

test("fenced code blocks are removed entirely", () => {
  const stripped = stripMarkdown(
    "before\n\n```js\nconst secret = 1;\n```\n\nafter",
  );
  assert.ok(!stripped.includes("secret"));
  assert.ok(stripped.includes("before") && stripped.includes("after"));
});

test("the description skips a first paragraph that only repeats the title", () => {
  const body = "# Tables\n\nTables\n\nThe real summary sentence.";
  assert.equal(
    extractDescription(body, "Tables"),
    "The real summary sentence.",
  );
});

test("a long description is cut at a word boundary", () => {
  const body = "# T\n\n" + "word ".repeat(60);
  const description = extractDescription(body, "T", 40) ?? "";
  assert.ok(description.length <= 41, description);
  assert.ok(description.endsWith("…"));
  assert.ok(!description.includes("wor…"));
});

test("no description when there is nothing but the title", () => {
  assert.equal(extractDescription("# Only", "Only"), null);
});

test("the first nav item owns the docs root and later links use their slugs", () => {
  const pages = [{ id: "01-intro" }, { id: "02-guides/01-setup" }];

  assert.deepEqual(
    navigationItems(
      buildDocsNavigation(pages, pages[0].id, { docsBase: "/docs" }),
    ).map((item) => item.href),
    ["/docs", "/docs/guides/setup"],
  );

  // routeBase "/" is normalised to "" by the caller, so links stay single-slashed.
  assert.deepEqual(
    navigationItems(
      buildDocsNavigation(pages, pages[0].id, { docsBase: "" }),
    ).map((item) => item.href),
    ["/", "/guides/setup"],
  );

  assert.deepEqual(
    navigationItems(
      buildDocsNavigation(pages, pages[0].id, { docsBase: "/manual" }),
    ).map((item) => item.href),
    ["/manual", "/manual/guides/setup"],
  );
});

test("nav links include Astro's deployment base", () => {
  const pages = [{ id: "01-intro" }, { id: "02-guide" }];
  assert.deepEqual(
    navigationItems(
      buildDocsNavigation(pages, pages[0].id, {
        docsBase: "/docs",
        deploymentBase: "/repo/",
      }),
    ).map((item) => item.href),
    ["/repo/docs", "/repo/docs/guide"],
  );
});

test("root pages and chapters interleave by number", () => {
  const navigation = buildDocsNavigation(
    [
      { id: "01-intro" },
      { id: "02-guides/01-setup" },
      { id: "02-guides/02-deep" },
      { id: "03-changelog" },
    ],
    "01-intro",
    { docsBase: "/docs" },
  );

  assert.deepEqual(
    navigation.sections.map((s) =>
      s.type === "page"
        ? s.item.title
        : `${s.chapter}(${String(s.items.length)})`,
    ),
    ["Intro", "guides(2)", "Changelog"],
  );
});

test("grouping keeps a chapter together even when its pages are apart", () => {
  const navigation = buildDocsNavigation(
    [{ id: "02-a/01-x" }, { id: "02-a/02-y" }],
    "02-a/01-x",
    { docsBase: "/docs" },
  );
  const sections = navigation.sections;
  assert.equal(sections.length, 1);
  assert.equal(sections[0].type, "chapter");
});

test("navigation derives active, previous and next pages together", () => {
  const pages = [{ id: "01-intro" }, { id: "02-guide" }, { id: "03-api" }];
  const navigation = buildDocsNavigation(pages, "02-guide", {
    docsBase: "/docs",
  });

  assert.equal(navigation.previousPage?.title, "Intro");
  assert.equal(navigation.nextPage?.title, "Api");
  assert.equal(
    navigation.sections.filter(
      (section) => section.type === "page" && section.item.isActive,
    ).length,
    1,
  );
});

// ── One title rule, wherever a page is named ─────────────────────────────────

test("frontmatter wins over the h1, which wins over the slug", () => {
  const body = "# From the body\n";
  assert.equal(
    docTitle({ id: "01-a", body, data: { title: "Explicit" } }),
    "Explicit",
  );
  assert.equal(docTitle({ id: "01-a", body }), "From the body");
  assert.equal(docTitle({ id: "01-getting-started" }), "Getting Started");
});

test("a short label replaces the title in navigation only", () => {
  const page = { id: "01-a", data: { title: "A Very Long Page Title" } };
  assert.equal(docLabel(page), "A Very Long Page Title");
  assert.equal(
    docLabel({ ...page, data: { ...page.data, label: "Short" } }),
    "Short",
  );
  assert.equal(
    docTitle({ ...page, data: { ...page.data, label: "Short" } }),
    "A Very Long Page Title",
  );
});

// ── Frontmatter order ───────────────────────────────────────────────────────

test("frontmatter order replaces the number the filename supplies", () => {
  assert.deepEqual(docOrder({ id: "05-a" }), { primary: 5, secondary: 5 });
  assert.deepEqual(docOrder({ id: "05-a", data: { order: 1 } }), {
    primary: 1,
    secondary: 1,
  });
});

test("inside a chapter, frontmatter order moves the page, not the chapter", () => {
  assert.deepEqual(docOrder({ id: "02-guides/05-a", data: { order: 1 } }), {
    primary: 2,
    secondary: 1,
  });
});

test("frontmatter order re-sorts pages against their filenames", () => {
  const pages = [
    { id: "01-first" },
    { id: "02-second", data: { order: 99 } },
    { id: "03-third" },
  ];
  assert.deepEqual(
    sortDocPages(pages).map((page) => page.id),
    ["01-first", "03-third", "02-second"],
  );
});

test("an ordered page can take the opening route from the first file", () => {
  const pages = [{ id: "01-intro" }, { id: "02-welcome", data: { order: 0 } }];
  assert.equal(sortDocPages(pages)[0].id, "02-welcome");
});

// ── Keywords ────────────────────────────────────────────────────────────────

test("keywords are indexed for search, and default to none", () => {
  const index = buildSearchIndex([
    { id: "01-a", body: "# A", data: { keywords: ["media", "markdown"] } },
    { id: "02-b", body: "# B" },
  ]);
  assert.deepEqual(index[0].keywords, ["media", "markdown"]);
  assert.deepEqual(index[1].keywords, []);
});

// ── The locale directory is split off before anything else reads the id ──────

test("a locale directory is split off the collection id", () => {
  assert.deepEqual(splitDocLocale("it/02-guides/01-setup", ["en", "it"]), {
    locale: "it",
    id: "02-guides/01-setup",
  });
});

test("a directory that is not a configured locale is left in place", () => {
  assert.deepEqual(splitDocLocale("guides/01-setup", ["en", "it"]), {
    locale: null,
    id: "guides/01-setup",
  });
  assert.deepEqual(splitDocLocale("it", ["en", "it"]), {
    locale: null,
    id: "it",
  });
});

test("ordering and chapters read the id without its locale", () => {
  const page = { id: "it/02-guides/01-setup", localeId: "02-guides/01-setup" };
  assert.equal(routedId(page), "02-guides/01-setup");
  assert.deepEqual(docOrder(page), { primary: 2, secondary: 1 });
  assert.equal(parseDocCollectionId(routedId(page)).chapter, "guides");
});

// Three segments are only legal because the locale is gone by the time the
// structure is checked.
test("a chaptered page inside a locale is a valid structure", () => {
  assert.doesNotThrow(() => {
    validateDocsStructure(
      [{ id: "it/02-guides/01-setup", localeId: "02-guides/01-setup" }],
      "it",
    );
  });
});

test("a structure error names the file on disk, locale included", () => {
  assert.throws(() => {
    validateDocsStructure([{ id: "it/a/b/c", localeId: "a/b/c" }], "it");
  }, /it\/a\/b\/c: only one chapter directory/);
});
