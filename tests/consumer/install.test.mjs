import { test } from "node:test";
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
 * Installs the packed tarball into a throwaway project, the way a reader would.
 * Everything that has broken so far — transitive resolution, Tailwind scanning
 * node_modules, .astro files shipped as source — only shows up here.
 */
test(
  "a fresh project builds from the published tarball",
  { timeout: 600_000 },
  () => {
    const tarball = run("npm", ["pack", "--pack-destination", tmpdir()], PKG)
      .trim()
      .split("\n")
      .pop();

    const project = mkdtempSync(join(tmpdir(), "jaad-consumer-"));
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

    const dist = join(project, "dist");
    const pages = walk(dist)
      .filter((f) => f.endsWith(".html"))
      .map((f) => f.slice(dist.length));

    assert.ok(pages.includes("/docs/index.html"), "no docs index");
    assert.ok(pages.includes("/docs/getting-started/index.html"));
    assert.ok(
      pages.includes("/docs/guides/deep-dive/index.html"),
      "nested chapter page missing",
    );

    const home = readFileSync(join(dist, "docs/index.html"), "utf8");

    // site reaches Astro through the wrapper, so urls are absolute.
    assert.match(home, /<link rel="canonical" href="https:\/\/example\.dev/);
    assert.match(home, /<img src="\/logo\.svg"/, "logo not rendered");
    assert.match(
      home,
      /<meta name="consumer-probe" content="ok"/,
      "head entry not injected",
    );

    // The mobile menu used to print the raw config key and repeat the repo.
    const mobileMenu = home.match(
      /<jaad-nav-mobile[\s\S]*?<\/jaad-nav-mobile>/,
    )[0];
    assert.match(
      mobileMenu,
      />GitHub</,
      "mobile menu does not use forge labels",
    );
    assert.equal(
      (home.match(/https:\/\/github\.com\/example\/consumer/g) ?? []).length,
      2,
      "the repository link is not listed exactly once per menu",
    );

    const notFound = readFileSync(join(dist, "404.html"), "utf8");
    assert.match(
      notFound,
      /<title>404 \| Consumer Test<\/title>/,
      "the 404 page does not carry the consumer's own title",
    );

    const css = walk(dist)
      .filter((f) => f.endsWith(".css") || f.endsWith(".html"))
      .map((f) => readFileSync(f, "utf8"))
      .join("\n");

    assert.deepEqual(
      missingFrom(css, packageClasses(join(PKG, "src"))),
      [],
      "package utilities missing from the CSS",
    );

    assert.ok(
      css.includes("var(--shiki-light)"),
      "jaamd's dual-theme CSS did not survive the transitive install",
    );
    assert.ok(css.includes("--jaamd-"), "jaamd markdown styles missing");

    // src/jaad.css is a convention, and it is worthless unless it lands after
    // the package's own tokens.
    const tokenAt = css.indexOf("--color-background:");
    const overrideAt = css.indexOf("#3b5bdb");
    assert.notEqual(overrideAt, -1, "src/jaad.css was not picked up");
    assert.ok(
      overrideAt > tokenAt,
      "src/jaad.css loaded before the package tokens, so it cannot override them",
    );

    const index = JSON.parse(
      readFileSync(join(dist, "search-index.json"), "utf8"),
    );
    assert.equal(index.length, 2);

    // routeBase moves the routes; every internal link has to follow, which is
    // what silently broke before.
    writeFileSync(
      join(project, "jaad.config.ts"),
      `import { defineJaadConfig } from "@lancher-dev/jaad";
export default defineJaadConfig({
  site: "https://example.dev",
  title: "Consumer Test",
  routeBase: "/",
});
`,
    );
    run("npx", ["astro", "build"], project);

    const rebased = walk(dist)
      .filter((f) => f.endsWith(".html"))
      .map((f) => f.slice(dist.length));
    assert.ok(
      rebased.includes("/getting-started/index.html"),
      "pages not remounted",
    );
    assert.ok(rebased.includes("/guides/deep-dive/index.html"));

    // The whole point of routeBase "/": the docs index becomes the site index.
    assert.ok(rebased.includes("/index.html"), "no index at the new root");
    assert.match(
      readFileSync(join(dist, "index.html"), "utf8"),
      /docs-sidebar-left/,
      "the root page is not the docs index",
    );

    const remounted = readFileSync(
      join(dist, "getting-started/index.html"),
      "utf8",
    );
    assert.match(
      remounted,
      /href="\/guides\/deep-dive"/,
      "sidebar still points at the old base",
    );
    assert.ok(
      !/href="\/docs\//.test(remounted),
      "a link still points under /docs after remounting",
    );
  },
);
