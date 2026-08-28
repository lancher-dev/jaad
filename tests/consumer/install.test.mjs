import { before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, cpSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { walk, packageClasses, missingFrom } from "../dist.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const PKG = join(ROOT, "packages", "jaad");

const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: "pipe" });

/**
 * Captures the contents of a directory for later assertion.
 */
function snapshot(dist) {
  const files = walk(dist);
  const contents = new Map(
    files.map((f) => [f.slice(dist.length), readFileSync(f, "utf8")]),
  );

  return {
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
    const tarball = run("npm", ["pack", "--pack-destination", tmpdir()], PKG)
      .trim()
      .split("\n")
      .pop();

    project = mkdtempSync(join(tmpdir(), "jaad-consumer-"));
    cpSync(join(HERE, "fixture"), project, { recursive: true });
    writeFileSync(
      join(project, "package.json"),
      JSON.stringify(
        {
          name: "consumer-test",
          private: true,
          type: "module",
          dependencies: {
            astro: "^7.2.0",
            "@lancher-dev/jaad": join(tmpdir(), tarball),
          },
        },
        null,
        2,
      ),
    );

    run("npm", ["install", "--no-audit", "--no-fund"], project);
    run("npx", ["astro", "build"], project);
    built = snapshot(join(project, "dist"));

    // routeBase moves the routes; every internal link has to follow, which is
    // what silently broke before. `appearance` is pinned in the same pass.
    writeFileSync(
      join(project, "jaad.config.ts"),
      `import { defineJaadConfig } from "@lancher-dev/jaad";
export default defineJaadConfig({
  site: "https://example.dev",
  title: "Consumer Test",
  routeBase: "/",
  appearance: "dark",
});
`,
    );
    run("npx", ["astro", "build"], project);
    remounted = snapshot(join(project, "dist"));
  });

  test("every documentation page is built, nesting included", () => {
    assert.ok(built.pages.includes("/docs/index.html"), "no docs index");
    assert.ok(built.pages.includes("/docs/getting-started/index.html"));
    assert.ok(
      built.pages.includes("/docs/guides/deep-dive/index.html"),
      "nested chapter page missing",
    );

    const index = JSON.parse(built.read("search-index.json"));
    assert.equal(index.length, 2, "the search index missed a page");
  });

  test("the config reaches the head of the page", () => {
    const home = built.read("docs/index.html");
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
  });

  test("both menus list the repository once, with its forge label", () => {
    const home = built.read("docs/index.html");
    const menu = home.match(/<jaad-nav-mobile[\s\S]*?<\/jaad-nav-mobile>/)[0];

    assert.match(menu, />GitHub</, "mobile menu does not use forge labels");
    assert.equal(
      (home.match(/https:\/\/github\.com\/example\/consumer/g) ?? []).length,
      2,
      "the repository link is not listed exactly once per menu",
    );
  });

  test("a page of the consumer's own runs on the exported layout", () => {
    const custom = built.read("about/index.html");
    assert.match(custom, /<title>About \| Consumer Test<\/title>/);
    assert.match(custom, /<header[^>]*class="[^"]*jaad-chrome/, "no chrome");
    assert.match(
      custom,
      /<main class="jaad-main-bare">/,
      "bare did not drop the page spacing",
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
    const home = built.read("docs/index.html");
    assert.match(home, /<jaad-theme-toggle>/, "no theme switcher by default");
    assert.match(home, /prefers-color-scheme/, "no theme script by default");
  });

  test("routeBase remounts the routes and every link follows", () => {
    assert.ok(
      remounted.pages.includes("/getting-started/index.html"),
      "pages not remounted",
    );
    assert.ok(remounted.pages.includes("/guides/deep-dive/index.html"));
    // The whole point of routeBase "/": the docs index becomes the site index.
    assert.ok(
      remounted.pages.includes("/index.html"),
      "no index at the new root",
    );
    assert.match(
      remounted.read("index.html"),
      /docs-sidebar-left/,
      "the root page is not the docs index",
    );

    const page = remounted.read("getting-started/index.html");
    assert.match(
      page,
      /href="\/guides\/deep-dive"/,
      "sidebar still points at the old base",
    );
    assert.doesNotMatch(
      page,
      /href="\/docs\//,
      "a link still points under /docs after remounting",
    );
  });

  test("a pinned appearance drops the switcher and the script", () => {
    for (const name of ["index.html", "getting-started/index.html"]) {
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
