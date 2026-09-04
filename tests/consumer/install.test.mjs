import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, writeFileSync, readFileSync } from "node:fs";
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

/**
 * Captures the contents of a directory for later assertion.
 */
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
});
`,
    );
    run("npx", ["astro", "build"], project);
    remounted = snapshot(join(project, "dist"));
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
    const menu = home.match(/<jaad-nav-mobile[\s\S]*?<\/jaad-nav-mobile>/)[0];

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

  test("the deprecated Base export remains compatible for one cycle", () => {
    const legacy = built.read("legacy/index.html");
    assert.match(legacy, /<title>Legacy \| Consumer Test<\/title>/);
    assert.match(legacy, /data-legacy-layout/);
    assert.match(legacy, /<main class="jaad-main-bare">/);
  });

  test("the conventional docs frame receives and arranges semantic slots", () => {
    const home = built.read("index.html");
    assert.match(
      home,
      /data-custom-docs-frame[^>]*data-page-id="01-getting-started"/,
    );
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
