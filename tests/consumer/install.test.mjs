import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, cpSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { walk } from "../dist.mjs";

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
          dependencies: { astro: "^7.2.0", jaad: join(tmpdir(), tarball) },
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

    const css = walk(join(dist, "_astro"))
      .filter((f) => f.endsWith(".css"))
      .map((f) => readFileSync(f, "utf8"))
      .join("\n");

    const escape = (c) => c.replace(/[.:/[\]%()!,#]/g, (x) => "\\" + x);
    const classes = new Set();
    for (const file of walk(join(PKG, "src")).filter((f) =>
      f.endsWith(".astro"),
    )) {
      for (const m of readFileSync(file, "utf8").matchAll(
        /\bclass(?:Name)?="([^"{}]+)"/g,
      )) {
        for (const token of m[1].split(/\s+/)) if (token) classes.add(token);
      }
    }
    const missing = [...classes].filter((c) => !css.includes("." + escape(c)));
    assert.deepEqual(
      missing.sort(),
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
  },
);
