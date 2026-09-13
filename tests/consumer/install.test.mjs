import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  cpSync,
  mkdirSync,
  rmSync,
  writeFileSync,
  readFileSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { walk, packageClasses, missingFrom } from "../dist.mjs";
import {
  cleanupTemporaryDirectories,
  packPackage,
  run,
  temporaryDirectory,
} from "./helpers.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const PKG = join(ROOT, "packages", "jaad");

/** A built directory, frozen so the later rebuilds can be compared to it. */
function snapshot(dist) {
  const files = walk(dist);
  const contents = new Map(
    files.map((f) => [f.slice(dist.length), readFileSync(f, "utf8")]),
  );

  return {
    files: [...contents.keys()],
    pages: [...contents.keys()].filter((f) => f.endsWith(".html")),
    read: (relative) => {
      const file = contents.get("/" + relative);
      assert.ok(file !== undefined, `${relative} was not built`);
      return file;
    },
    css: [...contents]
      .filter(([f]) => f.endsWith(".css") || f.endsWith(".html"))
      .map(([, body]) => body)
      .join("\n"),
    /** Only the stylesheets one page links, so a layout's set is testable. */
    cssOf: (relative) => {
      const html = contents.get("/" + relative);
      assert.ok(html !== undefined, `${relative} was not built`);
      const linked = [
        ...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g),
        // The href carries Astro's base; dist keys do not.
      ].map((m) => contents.get(m[1].slice(m[1].indexOf("/_astro/"))) ?? "");
      const inline = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(
        (m) => m[1],
      );
      return [...linked, ...inline].join("\n");
    },
  };
}

/**
 * Installs the packed tarball into a throwaway project, the way a reader would.
 * Everything that has broken so far — transitive resolution, Tailwind scanning
 * node_modules, .astro files shipped as source — only shows up here.
 */
describe("a project that installed the published tarball", () => {
  let project;
  let built;
  let remounted;
  let localised;

  before(() => {
    const tarball = packPackage(PKG);

    project = temporaryDirectory("jaad-consumer-");
    cpSync(join(HERE, "fixture"), project, { recursive: true });
    writeFileSync(
      join(project, "package.json"),
      JSON.stringify(
        {
          name: "consumer-test",
          private: true,
          type: "module",
          dependencies: {
            astro: "7.3.1",
            "@lancher-dev/jaad": tarball,
          },
        },
        null,
        2,
      ),
    );

    run("npm", ["install", "--no-audit", "--no-fund"], project);
    run("npx", ["astro", "build"], project);
    built = snapshot(join(project, "dist"));

    // A landing-page site opts into nested docs. Astro's deployment base and
    // every JAAD-owned URL have to move together.
    writeFileSync(
      join(project, "jaad.config.ts"),
      `import { defineJaadConfig } from "@lancher-dev/jaad";
export default defineJaadConfig({
  site: "https://example.dev",
  base: "/repo",
  title: "Consumer Test",
  routeBase: "/docs",
  logo: "/logo.svg",
  appearance: "dark",
  theme: "dracula",
});
`,
    );
    run("npx", ["astro", "build"], project);
    remounted = snapshot(join(project, "dist"));

    // Locale directories under docs/: the same pages, in two languages.
    const docs = join(project, "docs");
    rmSync(docs, { recursive: true });
    mkdirSync(join(docs, "en", "02-guides"), { recursive: true });
    mkdirSync(join(docs, "it"), { recursive: true });
    // Created but never written: it must not reach the switcher or the routes.
    mkdirSync(join(docs, "fr"), { recursive: true });
    writeFileSync(
      join(docs, "en", "01-getting-started.md"),
      "---\ntitle: Getting Started\n---\n\n# Getting Started\n\nEnglish.\n",
    );
    writeFileSync(
      join(docs, "en", "02-guides", "01-deep-dive.md"),
      "# Deep Dive\n\nOnly in English.\n",
    );
    writeFileSync(
      join(docs, "it", "01-per-iniziare.md"),
      "---\ntitle: Per iniziare\n---\n\n# Per iniziare\n\nItaliano.\n",
    );
    writeFileSync(
      join(project, "jaad.config.ts"),
      `import { defineJaadConfig } from "@lancher-dev/jaad";
export default defineJaadConfig({
  site: "https://example.dev",
  title: "Consumer Test",
  lang: "en",
});
`,
    );
    run("npx", ["astro", "build"], project);
    localised = snapshot(join(project, "dist"));
  });

  after(cleanupTemporaryDirectories);

  test("every documentation page is built, nesting included", () => {
    assert.ok(built.pages.includes("/index.html"), "no docs index");
    assert.ok(built.pages.includes("/getting-started/index.html"));
    assert.ok(
      built.pages.includes("/guides/deep-dive/index.html"),
      "nested chapter page missing",
    );

    assert.match(
      built.read("getting-started/index.html"),
      /http-equiv="refresh"[^>]+url=\//,
      "the opening page's named slug is not a redirect",
    );

    const index = JSON.parse(built.read("search-index.json"));
    assert.equal(index.length, 2, "the search index missed a page");
    assert.equal(index[0].slug, "", "search does not point at the docs root");
  });

  test("frontmatter renames, reorders and describes a page", () => {
    const deepDive = built.read("guides/deep-dive/index.html");

    assert.match(deepDive, /<title>A Deep Dive Into Everything \| /);
    assert.match(
      deepDive,
      /<a[^>]+href="\/guides\/deep-dive"[^>]*>[\s\S]{0,200}?Deep Dive</,
      "the sidebar does not use the short label",
    );

    assert.match(deepDive, /<meta name="author" content="Ada Lovelace"/);
    assert.match(
      deepDive,
      /<meta property="article:modified_time" content="2026-09-12T/,
    );
    assert.match(
      deepDive,
      /<meta property="og:image" content="https:\/\/example\.dev\/logo\.svg"/,
      "a page-level ogImage did not override the site's",
    );
    assert.match(
      deepDive,
      /"author":\{"@type":"Person","name":"Ada Lovelace"\}/,
    );

    const home = built.read("index.html");
    assert.match(home, /<meta name="keywords" content="alpha, beta"/);
    assert.match(home, /"keywords":\["alpha","beta"\]/);
  });

  test("a draft is left out of the production build entirely", () => {
    assert.ok(
      !built.pages.some((file) => file.includes("draft")),
      "a draft page was routed",
    );

    const index = JSON.parse(built.read("search-index.json"));
    assert.ok(
      !index.some((entry) => entry.slug === "draft"),
      "a draft page reached the search index",
    );
    assert.doesNotMatch(built.read("llms.txt"), /\/draft/);
    assert.deepEqual(index[0].keywords, ["alpha", "beta"]);
  });

  test("locale directories build one documentation site per language", () => {
    // The default locale keeps the urls it had before the second language.
    assert.ok(localised.pages.includes("/index.html"), "no default index");
    assert.ok(
      localised.pages.includes("/guides/deep-dive/index.html"),
      "the default locale lost its chaptered page",
    );
    // Three directory levels, which were a structure error before i18n.
    assert.ok(localised.pages.includes("/it/index.html"), "no /it index");

    assert.ok(
      !localised.pages.includes("/it/guides/deep-dive/index.html"),
      "an untranslated page was built anyway",
    );

    assert.ok(
      !localised.files.some((file) => file.startsWith("/fr")),
      "an empty locale directory was built anyway",
    );

    const italian = JSON.parse(localised.read("it/search-index.json"));
    assert.deepEqual(
      italian.map((entry) => entry.slug),
      [""],
      "the italian index is not scoped to italian",
    );
    assert.match(localised.read("it/llms.txt"), /\/it\//);
  });

  test("a localised page declares its own language and its alternates", () => {
    const italian = localised.read("it/index.html");
    assert.match(italian, /<html lang="it"/);
    assert.match(italian, /<meta property="og:locale" content="it"/);
    assert.match(
      italian,
      /<link rel="alternate" hreflang="it" href="https:\/\/example\.dev\/it"/,
    );

    const english = localised.read("index.html");
    assert.match(english, /<html lang="en"/);
    assert.match(
      english,
      /<link rel="alternate" hreflang="x-default" href="https:\/\/example\.dev\/"/,
    );

    // An untranslated page advertises no alternate it does not have. The
    // switcher still links to Italian, so this looks only at <head>.
    const deepDive = localised.read("guides/deep-dive/index.html");
    assert.doesNotMatch(deepDive, /<link rel="alternate" hreflang="it"/);
  });

  test("structured data roots the breadcrumb in the page's own locale", () => {
    const ld = (html) =>
      JSON.parse(
        html.match(
          /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
        )[1],
      );

    const italian = ld(localised.read("it/index.html"));
    assert.equal(
      italian.breadcrumb.itemListElement[0].item,
      "https://example.dev/it",
    );

    const english = ld(localised.read("index.html"));
    assert.equal(
      english.breadcrumb.itemListElement[0].item,
      "https://example.dev/",
    );
  });

  test("the switcher ships with two locales and falls back per page", () => {
    const deepDive = localised.read("guides/deep-dive/index.html");
    assert.match(deepDive, /<jaad-locale-switcher/);
    assert.match(deepDive, /Italiano/);
    assert.doesNotMatch(
      deepDive,
      /hreflang="fr"/,
      "an empty locale was offered",
    );
    // No Italian deep dive, so Italian lands on the Italian opening page.
    assert.match(deepDive, /<a href="\/it" hreflang="it"/);
  });

  test("a single-locale site renders no switcher at all", () => {
    assert.doesNotMatch(built.read("index.html"), /<jaad-locale-switcher/);
    assert.doesNotMatch(
      remounted.read("docs/index.html"),
      /jaad-locale-switcher/,
    );
  });

  // A preset's palette reaches JAAD's tokens only through the reverse bridge.
  // Without it a page renders the default palette while the docs render dracula.
  test("a preset palette reaches pages of your own, not just the docs", () => {
    const bridge = /--color-background:\s*var\(--jaamd-bg\)/;
    assert.match(
      remounted.cssOf("docs/index.html"),
      bridge,
      "the docs lost the preset bridge",
    );
    assert.match(
      remounted.cssOf("page/index.html"),
      bridge,
      "a page built on the exported Page.astro has no preset palette",
    );
  });

  test("the config reaches the head of the page", () => {
    const home = built.read("index.html");
    // `site` arrives through the wrapper, so urls are absolute.
    assert.match(home, /<link rel="canonical" href="https:\/\/example\.dev/);
    assert.match(home, /<img src="\/logo\.svg"/, "logo not rendered");
    assert.match(
      home,
      /<meta name="consumer-probe" content="ok"/,
      "head entry not injected",
    );
    assert.match(
      built.read("404.html"),
      /<title>404 \| Consumer Test<\/title>/,
      "the 404 page does not carry the consumer's own title",
    );
    assert.doesNotMatch(
      home,
      /(?:property|name)="(?:og:image|twitter:image)"/,
      "a missing social image was advertised",
    );
    assert.match(home, /name="twitter:card" content="summary"/);
  });

  test("the repository is listed once, and the mobile menu does not repeat it", () => {
    const home = built.read("index.html");
    const found = home.match(/<jaad-nav-mobile[\s\S]*?<\/jaad-nav-mobile>/);
    assert.ok(found, "the mobile menu was not rendered at all");
    const menu = found[0];

    assert.match(menu, />API</, "the mobile menu lost the nav links");
    assert.doesNotMatch(menu, /github\.com/, "the mobile menu repeats an icon");
    assert.equal(
      (home.match(/href="https:\/\/github\.com\/example\/consumer"/g) ?? [])
        .length,
      1,
      "the repository link is not listed exactly once",
    );
    assert.match(home, /aria-label="GitHub"/, "no forge label on the icon");
  });

  test("an empty nav renders no mobile menu at all", () => {
    assert.doesNotMatch(
      remounted.read("docs/index.html"),
      /<jaad-nav-mobile/,
      "the mobile menu is rendered with nothing to put in it",
    );
  });

  test("a page of the consumer's own keeps its local layout", () => {
    const custom = built.read("about/index.html");
    assert.match(custom, /<title>About \| Consumer Test<\/title>/);
    assert.match(custom, /<body data-site-layout>/);
    assert.doesNotMatch(custom, /jaad-chrome/);
  });

  test("the page layout puts the site chrome around a page of your own", () => {
    const page = built.read("page/index.html");
    assert.match(page, /<title>Changelog \| Consumer Test<\/title>/);
    assert.match(page, /data-page-layout/);
    assert.match(page, /<main class="jaad-main-bare">/);
    assert.match(page, /<header[^>]*class="jaad-chrome"/, "no header chrome");
    assert.match(page, /aria-label="GitHub"/, "no configured social links");
    assert.doesNotMatch(page, /<body data-docs/, "the docs body leaked in");
  });

  test("the conventional docs frame receives and arranges semantic slots", () => {
    const home = built.read("index.html");
    assert.match(
      home,
      /data-custom-docs-frame[^>]*data-page-id="01-getting-started"/,
    );
    assert.match(home, /data-page-title="Frontmatter Wins"/);
    assert.ok(
      home.indexOf("data-copy-page") < home.indexOf('aria-label="Breadcrumb"'),
      "the custom frame did not move page actions before breadcrumbs",
    );
    assert.doesNotMatch(home, /<footer/, "the omitted footer was rendered");
    assert.match(
      built.css.replace(/\s+/g, ""),
      /\[data-jaad-default-frame\]\.docs-sidebar-left[^}]*position:fixed/,
      "default positioning is not scoped away from custom frames",
    );
  });

  test("the package's own styles survive a transitive install", () => {
    assert.deepEqual(
      missingFrom(built.css, packageClasses(join(PKG, "src"))),
      [],
      "package utilities missing from the CSS",
    );
    assert.ok(
      built.css.includes("var(--shiki-light)"),
      "jaamd's dual-theme CSS did not survive the transitive install",
    );
    assert.ok(built.css.includes("--jaamd-"), "jaamd markdown styles missing");
  });

  test("src/jaad.css overrides colours and widths alike", () => {
    // The convention is worthless unless it lands after the package's tokens.
    const tokenAt = built.css.indexOf("--color-background:");
    const overrideAt = built.css.indexOf("#3b5bdb");
    assert.notEqual(overrideAt, -1, "src/jaad.css was not picked up");
    assert.ok(
      overrideAt > tokenAt,
      "src/jaad.css loaded before the package tokens, so it cannot override them",
    );

    const width = built.css.lastIndexOf("--jaad-content-width:");
    assert.notEqual(width, -1, "the layout tokens did not ship");
    assert.match(
      built.css.slice(width, width + 40),
      /--jaad-content-width:\s*71rem/,
      "the content width override did not win",
    );
    assert.match(
      built.css.replace(/\s+/g, ""),
      /max-width:var\(--jaad-chrome-width\)/,
      "the chrome does not read the width token",
    );
  });

  test("the theme switcher and its script ship by default", () => {
    const home = built.read("index.html");
    assert.match(home, /<jaad-theme-toggle>/, "no theme switcher by default");
    assert.match(home, /prefers-color-scheme/, "no theme script by default");
  });

  test("routeBase nests the docs and every link follows Astro's base", () => {
    assert.ok(
      remounted.pages.includes("/docs/getting-started/index.html"),
      "pages not remounted",
    );
    assert.ok(remounted.pages.includes("/docs/guides/deep-dive/index.html"));
    assert.ok(
      remounted.pages.includes("/docs/index.html"),
      "no index at the nested docs root",
    );
    assert.ok(
      !remounted.pages.includes("/404.html"),
      "JAAD still owns the site's global 404 when docs are nested",
    );
    assert.match(
      remounted.read("docs/index.html"),
      /docs-sidebar-left/,
      "the nested page is not the docs index",
    );

    const page = remounted.read("docs/guides/deep-dive/index.html");
    assert.match(
      page,
      /href="\/repo\/docs"/,
      "the opening-page link missed the deployment base",
    );
    assert.match(
      page,
      /src="\/repo\/logo\.svg"/,
      "a public asset missed the deployment base",
    );
    assert.match(
      page,
      /data-base="\/repo\/docs"/,
      "search missed the docs and deployment bases",
    );
    assert.match(
      page,
      /data-index-url="\/repo\/docs\/search-index\.json"/,
      "the search index escaped the documentation mount",
    );
    assert.match(
      page,
      /data-md-href="\/repo\/docs\/guides\/deep-dive\.md"/,
      "the raw markdown action missed the deployment base",
    );
    assert.match(
      remounted.read("docs/llms.txt"),
      /https:\/\/example\.dev\/repo\/docs\/getting-started\.md/,
      "llms.txt missed the deployment base",
    );
    assert.doesNotMatch(
      remounted.files.join("\n"),
      /^\/(?:llms\.txt|search-index\.json)$/m,
    );
    assert.ok(remounted.files.includes("/docs/search-index.json"));
    assert.match(
      remounted.read("docs/getting-started/index.html"),
      /url=\/repo\/docs/,
      "the opening-page redirect missed the deployment base",
    );
  });

  test("a pinned appearance drops the switcher and the script", () => {
    for (const name of [
      "docs/index.html",
      "docs/guides/deep-dive/index.html",
    ]) {
      const html = remounted.read(name);
      assert.match(
        html,
        /<html lang="en" class="dark"/,
        `${name} does not carry the pinned appearance`,
      );
      assert.doesNotMatch(
        html,
        /jaad-theme-toggle/,
        `${name} still renders the switcher for a pinned appearance`,
      );
      assert.doesNotMatch(
        html,
        /prefers-color-scheme/,
        `${name} still ships the theme script for a pinned appearance`,
      );
    }
  });
});
