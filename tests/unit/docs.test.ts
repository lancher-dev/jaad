import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseDocCollectionId,
  sortDocPages,
  getCleanSlug,
  slugToTitle,
  formatChapterTitle,
  extractTitleFromMarkdown,
  extractHeadingsFromMarkdown,
  stripMarkdown,
  extractDescription,
  buildDocNavItems,
} from "../../packages/jaad/src/utils/docs.ts";

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

test("frontmatter title beats the h1, which beats the slug", () => {
  const [a, b, c] = buildDocNavItems(
    [
      { id: "01-a", body: "# From Body", data: { title: "From Frontmatter" } },
      { id: "02-b", body: "# From Body" },
      { id: "03-c-page", body: "no heading" },
    ],
    "",
  );
  assert.equal(a.title, "From Frontmatter");
  assert.equal(b.title, "From Body");
  assert.equal(c.title, "C Page");
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
  const description = extractDescription(body, "T", 40)!;
  assert.ok(description.length <= 41, description);
  assert.ok(description.endsWith("…"));
  assert.ok(!description.includes("wor…"));
});

test("no description when there is nothing but the title", () => {
  assert.equal(extractDescription("# Only", "Only"), null);
});
