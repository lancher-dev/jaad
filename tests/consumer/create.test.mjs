import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { walk } from "../dist.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const PKG = join(ROOT, "packages", "jaad");
const CLI = join(ROOT, "packages", "create-jaad", "index.mjs");

const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: "pipe" });

/** The generated manifest asks npm for the published jaad; point it at ours. */
function useLocalJaad(project, tarball) {
  const file = join(project, "package.json");
  const manifest = JSON.parse(readFileSync(file, "utf8"));
  manifest.dependencies["@lancher-dev/jaad"] = tarball;
  writeFileSync(file, JSON.stringify(manifest, null, 2));
}

let tarball;
const pack = () =>
  (tarball ??= join(
    tmpdir(),
    run("npm", ["pack", "--pack-destination", tmpdir()], PKG)
      .trim()
      .split("\n")
      .pop(),
  ));

test(
  "the scaffolder produces a project that builds",
  { timeout: 600_000 },
  () => {
    const tarball = pack();
    const parent = mkdtempSync(join(tmpdir(), "jaad-create-"));

    run(
      "node",
      [CLI, "docs-site", "--title", "Scaffolded", "--no-install"],
      parent,
    );

    const project = join(parent, "docs-site");
    useLocalJaad(project, tarball);
    run("npm", ["install", "--no-audit", "--no-fund"], project);
    run("npx", ["astro", "build"], project);

    const built = walk(join(project, "dist")).map((f) =>
      f.slice(join(project, "dist").length),
    );
    assert.ok(built.includes("/docs/index.html"), "no docs index");
    assert.ok(
      built.includes("/docs/introduction/index.html"),
      "no sample page",
    );
    assert.match(
      readFileSync(join(project, "dist", "docs", "index.html"), "utf8"),
      /<title>Scaffolded<\/title>/,
      "the title did not reach the site",
    );
  },
);

/**
 * The reason `--here` exists: a repository that already has markdown, a
 * manifest, and files that are none of the scaffolder's business.
 */
test(
  "--here adds jaad to an existing repository without taking it over",
  { timeout: 600_000 },
  () => {
    const tarball = pack();
    const project = mkdtempSync(join(tmpdir(), "jaad-here-"));

    mkdirSync(join(project, "docs", "02-guides"), { recursive: true });
    writeFileSync(
      join(project, "package.json"),
      JSON.stringify({
        name: "@acme/my-library",
        version: "2.3.0",
        scripts: { test: "node --test" },
        dependencies: { "left-pad": "^1.3.0" },
      }),
    );
    writeFileSync(
      join(project, "docs", "01-overview.md"),
      "# Overview\n\nMine.\n",
    );
    writeFileSync(
      join(project, "docs", "02-guides", "01-setup.md"),
      "# Setup\n\nAlso mine.\n",
    );

    const output = run("node", [CLI, "--here", "--no-install"], project);
    assert.match(
      output,
      /found\s+2 markdown/,
      "existing pages were not noticed",
    );

    const manifest = JSON.parse(
      readFileSync(join(project, "package.json"), "utf8"),
    );
    assert.equal(
      manifest.name,
      "@acme/my-library",
      "the manifest was replaced",
    );
    assert.equal(manifest.version, "2.3.0");
    assert.equal(manifest.scripts.test, "node --test", "a script was lost");
    assert.equal(manifest.dependencies["left-pad"], "^1.3.0", "a dep was lost");
    // Adding this to someone's library changes how node reads every file in it.
    assert.equal(manifest.type, undefined, "type: module was forced on");

    useLocalJaad(project, tarball);
    run("npm", ["install", "--no-audit", "--no-fund"], project);
    run("npx", ["astro", "build"], project);

    const built = walk(join(project, "dist")).map((f) =>
      f.slice(join(project, "dist").length),
    );
    assert.ok(
      built.includes("/docs/overview/index.html"),
      "existing page missing",
    );
    assert.ok(
      built.includes("/docs/guides/setup/index.html"),
      "existing chapter missing",
    );
    assert.ok(
      !built.includes("/docs/introduction/index.html"),
      "a sample page was written over an existing docs folder",
    );
  },
);
