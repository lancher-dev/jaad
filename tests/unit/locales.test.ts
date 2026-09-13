import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  describeLocale,
  isLocale,
  localeTag,
  localePrefix,
  prefixedLocales,
  routedLocales,
} from "../../packages/jaad/src/locales.ts";
import {
  detectLocales,
  validateLocaleTree,
} from "../../packages/jaad/src/locale-tree.ts";

function docsTree(entries: string[]): string {
  const dir = mkdtempSync(join(tmpdir(), "jaad-locales-"));
  for (const entry of entries) {
    if (entry.endsWith(".md")) {
      mkdirSync(join(dir, entry, ".."), { recursive: true });
      writeFileSync(join(dir, entry), "# Page");
    } else mkdirSync(join(dir, entry), { recursive: true });
  }
  return dir;
}

// ── What counts as a locale ──────────────────────────────────────────────────

test("a two-letter language, with an optional script and region, is a locale", () => {
  assert.equal(isLocale("it"), true);
  assert.equal(isLocale("pt-br"), true);
  assert.equal(isLocale("zh-hans"), true);
  assert.equal(isLocale("zh-hans-cn"), true);
});

// A three-letter directory is the common case: docs/api must stay a chapter.
test("anything that is not an ISO 639-1 language is a chapter", () => {
  assert.equal(isLocale("api"), false);
  assert.equal(isLocale("guides"), false);
  assert.equal(isLocale("xx"), false);
  assert.equal(isLocale("reference"), false);
});

test("a locale code becomes its BCP-47 tag", () => {
  assert.equal(localeTag("pt-br"), "pt-BR");
  assert.equal(localeTag("zh-hans"), "zh-Hans");
  assert.equal(localeTag("it"), "it");
});

// ── Flags ────────────────────────────────────────────────────────────────────

test("an explicit region names the flag, whatever the language", () => {
  assert.equal(describeLocale("pt-br").flag, "🇧🇷");
  assert.equal(describeLocale("en-us").flag, "🇺🇸");
});

test("a language without a region falls back to its listed one", () => {
  assert.equal(describeLocale("it").flag, "🇮🇹");
  assert.equal(describeLocale("en").flag, "🇬🇧");
  assert.equal(describeLocale("ja").flag, "🇯🇵");
});

// Uppercasing the language would produce "AA", which draws an empty box.
test("a language with no listed region gets no flag rather than a wrong one", () => {
  assert.equal(describeLocale("aa").flag, null);
});

test("the menu label is the language's own name", () => {
  assert.equal(describeLocale("it").name, "Italiano");
  assert.equal(describeLocale("en").name, "English");
});

// ── Detection ────────────────────────────────────────────────────────────────

test("two locale directories switch the docs to being localised", () => {
  const dir = docsTree(["en/01-intro.md", "it/01-intro.md"]);
  try {
    assert.deepEqual(detectLocales(dir, "en"), ["en", "it"]);
  } finally {
    rmSync(dir, { recursive: true });
  }
});

test("markdown anywhere inside the directory counts", () => {
  const dir = docsTree(["en/01-intro.md", "it/02-guide/01-setup.md"]);
  try {
    assert.deepEqual(detectLocales(dir, "en"), ["en", "it"]);
  } finally {
    rmSync(dir, { recursive: true });
  }
});

// An advertised locale with nothing in it is a link to a 404.
test("an empty locale directory is not a locale", () => {
  const dir = docsTree(["en/01-intro.md", "it"]);
  try {
    assert.deepEqual(detectLocales(dir, "en"), ["en"]);
  } finally {
    rmSync(dir, { recursive: true });
  }
});

// The tree stays localised, so en/ keeps being stripped and no url moves.
test("one locale left with content still owns the unprefixed urls", () => {
  const dir = docsTree(["en/01-intro.md", "it"]);
  try {
    const locales = detectLocales(dir, "en");
    assert.deepEqual(locales, ["en"]);
    assert.doesNotThrow(() => validateLocaleTree(dir, locales, "en"));
  } finally {
    rmSync(dir, { recursive: true });
  }
});

test("lang naming a locale that has no pages is reported", () => {
  const dir = docsTree(["en/01-intro.md", "it"]);
  try {
    assert.throws(
      () => validateLocaleTree(dir, detectLocales(dir, "en"), "it"),
      /lang is "it", which has no directory; found en/,
    );
  } finally {
    rmSync(dir, { recursive: true });
  }
});

// One directory that happens to read as a language is far more likely to be a
// chapter — an "IT" section — than a translation of nothing.
test("a single locale directory lang does not name stays a chapter", () => {
  const dir = docsTree(["it/01-guida.md", "01-intro.md"]);
  try {
    assert.deepEqual(detectLocales(dir, "en"), []);
  } finally {
    rmSync(dir, { recursive: true });
  }
});

// Starting a translation: docs/en/ alone, with lang "en", is deliberate. Read
// as a chapter it would break, since its own chapters would nest two deep.
test("a single locale directory lang names is the first language", () => {
  const dir = docsTree(["en/01-intro.md", "en/02-guides/01-setup.md"]);
  try {
    assert.deepEqual(detectLocales(dir, "en"), ["en"]);
  } finally {
    rmSync(dir, { recursive: true });
  }
});

test("the match is case-insensitive, like the directory names", () => {
  const dir = docsTree(["pt-br/01-intro.md"]);
  try {
    assert.deepEqual(detectLocales(dir, "pt-BR"), ["pt-br"]);
  } finally {
    rmSync(dir, { recursive: true });
  }
});

test("a tree with no locale directories is left alone", () => {
  const dir = docsTree(["01-intro.md", "02-guides"]);
  try {
    assert.deepEqual(detectLocales(dir, "en"), []);
  } finally {
    rmSync(dir, { recursive: true });
  }
});

// ── The mixed tree ───────────────────────────────────────────────────────────

test("a stray directory beside locales stops the build and is named", () => {
  const dir = docsTree(["en/01-a.md", "it/01-a.md", "guides"]);
  try {
    assert.throws(
      () => validateLocaleTree(dir, ["en", "it"], "en"),
      (error: Error) => {
        assert.match(error.message, /docs\/guides is not a locale/);
        assert.match(error.message, /en, it/);
        return true;
      },
    );
  } finally {
    rmSync(dir, { recursive: true });
  }
});

test("a page left outside the locale directories is reported too", () => {
  const dir = docsTree(["en/01-a.md", "it/01-a.md", "01-orphan.md"]);
  try {
    assert.throws(
      () => validateLocaleTree(dir, ["en", "it"], "en"),
      /01-orphan\.md is not a locale/,
    );
  } finally {
    rmSync(dir, { recursive: true });
  }
});

test("lang has to name one of the directories", () => {
  const dir = docsTree(["it/01-a.md", "fr/01-a.md"]);
  try {
    assert.throws(
      () => validateLocaleTree(dir, ["fr", "it"], "en"),
      /lang is "en", which has no directory; found fr, it/,
    );
  } finally {
    rmSync(dir, { recursive: true });
  }
});

test("a localised tree with a matching lang passes", () => {
  const dir = docsTree(["en/01-a.md", "it/01-a.md"]);
  try {
    assert.doesNotThrow(() => validateLocaleTree(dir, ["en", "it"], "en"));
  } finally {
    rmSync(dir, { recursive: true });
  }
});

// ── The one place the default locale's missing prefix is decided ─────────────

const locale = (code: string) => ({ code, tag: code, name: code, flag: null });

test("the default locale carries no prefix and the others do", () => {
  assert.equal(localePrefix("en", "en"), "");
  assert.equal(localePrefix("it", "en"), "it/");
  assert.equal(localePrefix(undefined, "en"), "");
});

test("only the prefixed locales get a route of their own", () => {
  assert.deepEqual(prefixedLocales([locale("en"), locale("it")], "en"), ["it"]);
  assert.deepEqual(prefixedLocales([], "en"), []);
});

// An unlocalised site still has to be built once.
test("a site with no locales is built in a single unlocalised pass", () => {
  assert.deepEqual(routedLocales([]), [undefined]);
  assert.deepEqual(routedLocales([locale("en"), locale("it")]), ["en", "it"]);
});
