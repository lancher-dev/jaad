import { after, test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { walk } from "../dist.mjs";
import {
  cleanupTemporaryDirectories,
  packPackage,
  run,
  temporaryDirectory,
} from "./helpers.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const PKG = join(ROOT, "packages", "jaad");
const CLI = join(ROOT, "packages", "create-jaad", "index.mjs");

/** The generated manifest asks npm for the published jaad; point it at ours. */
function useLocalJaad(project, tarball) {
  const file = join(project, "package.json");
  const manifest = JSON.parse(readFileSync(file, "utf8"));
  manifest.dependencies["@lancher-dev/jaad"] = tarball;
  writeFileSync(file, JSON.stringify(manifest, null, 2));
}

let tarball;
const pack = () => (tarball ??= packPackage(PKG));

function snapshotFiles(directory) {
  return walk(directory).map((file) => [
    file.slice(directory.length),
    readFileSync(file).toString("base64"),
  ]);
}

function runScaffolderHere(project) {
  return spawnSync(
    "node",
    [
      CLI,
      "--here",
      "--template",
      "site",
      "--title",
      "Existing Project",
      "--no-install",
    ],
    { cwd: project, encoding: "utf8" },
  );
}

after(cleanupTemporaryDirectories);

test(
  "the scaffolder produces a project that builds",
  { timeout: 600_000 },
  () => {
    const tarball = pack();
    const parent = temporaryDirectory("jaad-create-");

    const output = run(
      "node",
      [
        CLI,
        "docs-site",
        "--template",
        "docs",
        "--title",
        "Scaffolded",
        "--no-install",
      ],
      parent,
    );
    assert.match(output, /cd docs-site/);
    assert.match(output, /npm install/);
    assert.match(output, /npm run dev/);
    assert.match(output, /Start writing in docs\/01-introduction\.md/);

    const project = join(parent, "docs-site");
    useLocalJaad(project, tarball);
    run("npm", ["install", "--no-audit", "--no-fund"], project);
    run("npx", ["astro", "build"], project);

    const built = walk(join(project, "dist")).map((f) =>
      f.slice(join(project, "dist").length),
    );
    assert.ok(built.includes("/index.html"), "no docs index");
    assert.ok(
      built.includes("/introduction/index.html"),
      "no compatibility redirect for the sample page",
    );
    const home = readFileSync(join(project, "dist", "index.html"), "utf8");
    assert.match(home, /<title>Scaffolded<\/title>/, "title missing");
    assert.doesNotMatch(home, /rel="canonical"/);
    assert.doesNotMatch(home, /(?:property|name)="(?:og:url|twitter:url)"/);
    assert.doesNotMatch(home, /(?:property|name)="(?:og:image|twitter:image)"/);
    assert.doesNotMatch(home, /https?:\/\/localhost/);

    writeFileSync(
      join(project, "docs", "02-introduction.md"),
      "# Duplicate introduction\n",
    );
    const invalid = spawnSync("npx", ["astro", "build"], {
      cwd: project,
      encoding: "utf8",
    });
    assert.equal(invalid.status, 1, "an ambiguous docs tree still built");
    assert.match(
      `${invalid.stdout}\n${invalid.stderr}`,
      /jaad: invalid documentation structure[\s\S]*01-introduction, 02-introduction all resolve to \/introduction/,
    );
  },
);

test(
  "the site template keeps the landing page separate from the docs",
  { timeout: 600_000 },
  () => {
    const tarball = pack();
    const parent = temporaryDirectory("jaad-create-site-");

    run(
      "node",
      [
        CLI,
        "product-site",
        "--template",
        "site",
        "--title",
        "Product",
        "--no-install",
      ],
      parent,
    );

    const project = join(parent, "product-site");
    useLocalJaad(project, tarball);
    run("npm", ["install", "--no-audit", "--no-fund"], project);
    run("npx", ["astro", "build"], project);

    const built = walk(join(project, "dist")).map((f) =>
      f.slice(join(project, "dist").length),
    );
    assert.ok(built.includes("/index.html"), "no landing page");
    assert.ok(built.includes("/docs/index.html"), "no docs index");
    assert.ok(
      built.includes("/docs/introduction/index.html"),
      "no compatibility redirect for the sample page",
    );
    const landing = readFileSync(join(project, "dist", "index.html"), "utf8");
    assert.match(
      landing,
      /href="\/docs"[^>]*>\s*Read the documentation/,
      "the landing page does not link to the docs",
    );
    assert.doesNotMatch(landing, /jaad-chrome|jaad-theme-toggle/);
    const landingSource = readFileSync(
      join(project, "src", "pages", "index.astro"),
      "utf8",
    );
    assert.match(landingSource, /layouts\/SiteLayout\.astro/);
    assert.doesNotMatch(landingSource, /@lancher-dev\/jaad\/layouts/);
    assert.ok(
      existsSync(join(project, "src", "layouts", "SiteLayout.astro")),
      "the site template did not create a local layout",
    );
    assert.match(
      readFileSync(join(project, "jaad.config.ts"), "utf8"),
      /routeBase: "\/docs"/,
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
    const project = temporaryDirectory("jaad-here-");

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
    mkdirSync(join(project, "src", "pages"), { recursive: true });
    writeFileSync(
      join(project, "src", "pages", "index.astro"),
      "<h1 data-existing>Existing landing</h1>\n",
    );

    const output = run(
      "node",
      [
        CLI,
        "--here",
        "--template",
        "site",
        "--title",
        "My Library",
        "--no-install",
      ],
      project,
    );
    assert.match(
      output,
      /found\s+2 markdown/,
      "existing pages were not noticed",
    );
    assert.doesNotMatch(output, /\bcd\s/);
    assert.match(output, /npm install/);
    assert.match(output, /npm run dev/);
    assert.match(output, /Start writing in docs\//);

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
    assert.equal(
      existsSync(join(project, "src", "layouts", "SiteLayout.astro")),
      false,
      "an unused site layout was added beside an existing landing page",
    );

    useLocalJaad(project, tarball);
    run("npm", ["install", "--no-audit", "--no-fund"], project);
    run("npx", ["astro", "build"], project);

    const built = walk(join(project, "dist")).map((f) =>
      f.slice(join(project, "dist").length),
    );
    assert.match(
      readFileSync(join(project, "dist", "index.html"), "utf8"),
      /data-existing/,
      "the existing landing page was replaced",
    );
    assert.ok(
      built.includes("/docs/guides/setup/index.html"),
      "existing chapter missing",
    );
    assert.ok(
      !built.includes("/introduction/index.html"),
      "a sample page was written over an existing docs folder",
    );
  },
);

test("--here changes nothing when existing configurations need a manual merge", () => {
  const project = temporaryDirectory("jaad-here-config-conflict-");
  mkdirSync(join(project, "src"), { recursive: true });
  writeFileSync(
    join(project, "package.json"),
    JSON.stringify({ name: "existing-astro-project", private: true }, null, 2),
  );
  writeFileSync(
    join(project, "astro.config.mjs"),
    'import { defineConfig } from "astro/config";\nexport default defineConfig({});\n',
  );
  writeFileSync(
    join(project, "src", "content.config.ts"),
    "export const collections = {};\n",
  );

  const before = snapshotFiles(project);
  const result = runScaffolderHere(project);
  const output = `${result.stdout}\n${result.stderr}`;

  assert.equal(result.status, 1);
  assert.match(output, /cannot safely update this project/);
  assert.match(output, /astro\.config\.mjs/);
  assert.match(output, /src\/content\.config\.ts/);
  assert.match(output, /No files were changed/);
  assert.match(output, /existing-astro-project/);
  assert.deepEqual(snapshotFiles(project), before);
});

test("--here recognizes canonical JAAD configurations on rerun", () => {
  const project = temporaryDirectory("jaad-here-rerun-");
  mkdirSync(join(project, "src"), { recursive: true });
  writeFileSync(
    join(project, "package.json"),
    JSON.stringify(
      {
        name: "configured-project",
        private: true,
        devDependencies: {
          astro: "^7.3.1",
          "@lancher-dev/jaad": "^0.6.1",
        },
      },
      null,
      2,
    ),
  );
  writeFileSync(
    join(project, "astro.config.ts"),
    'export { default } from "@lancher-dev/jaad/site";\r\n',
  );
  writeFileSync(
    join(project, "src", "content.config.js"),
    'export { collections } from "@lancher-dev/jaad/content";\n',
  );
  writeFileSync(
    join(project, "jaad.config.mjs"),
    'export default { title: "Already configured" };\n',
  );

  const result = runScaffolderHere(project);
  const output = `${result.stdout}\n${result.stderr}`;
  assert.equal(result.status, 0, output);
  assert.match(output, /kept\s+astro\.config\.ts/);
  assert.match(output, /kept\s+src\/content\.config\.js/);
  assert.match(output, /kept\s+jaad\.config\.mjs/);
  assert.equal(existsSync(join(project, "astro.config.mjs")), false);
  assert.equal(existsSync(join(project, "src", "content.config.ts")), false);
  assert.equal(existsSync(join(project, "jaad.config.ts")), false);

  const manifest = JSON.parse(
    readFileSync(join(project, "package.json"), "utf8"),
  );
  assert.equal(manifest.dependencies, undefined);
  assert.equal(manifest.devDependencies.astro, "^7.3.1");
  assert.equal(manifest.devDependencies["@lancher-dev/jaad"], "^0.6.1");
});

test("--here recognizes every supported custom configuration filename", () => {
  const candidates = [
    "astro.config.ts",
    "astro.config.mjs",
    "astro.config.js",
    "src/content.config.ts",
    "src/content.config.mjs",
    "src/content.config.js",
  ];

  for (const candidate of candidates) {
    const project = temporaryDirectory("jaad-here-config-name-");
    mkdirSync(dirname(join(project, candidate)), { recursive: true });
    writeFileSync(join(project, candidate), "export default {};\n");
    const before = snapshotFiles(project);

    const result = runScaffolderHere(project);
    const output = `${result.stdout}\n${result.stderr}`;
    assert.equal(result.status, 1, candidate);
    assert.match(output, new RegExp(candidate.replaceAll(".", "\\.")));
    assert.deepEqual(snapshotFiles(project), before, candidate);
  }
});

test("--here preserves an invalid package manifest when it stops", () => {
  const project = temporaryDirectory("jaad-here-invalid-manifest-");
  writeFileSync(join(project, "package.json"), "{ not json }\n");
  const before = snapshotFiles(project);

  const result = runScaffolderHere(project);
  const output = `${result.stdout}\n${result.stderr}`;
  assert.equal(result.status, 1);
  assert.match(output, /package\.json is not valid JSON/);
  assert.match(output, /No files were changed/);
  assert.deepEqual(snapshotFiles(project), before);
});

test("--here rejects multiple JAAD configuration files without writing", () => {
  const project = temporaryDirectory("jaad-here-multiple-config-");
  writeFileSync(join(project, "jaad.config.ts"), "export default {};\n");
  writeFileSync(join(project, "jaad.config.js"), "export default {};\n");
  const before = snapshotFiles(project);

  const result = runScaffolderHere(project);
  const output = `${result.stdout}\n${result.stderr}`;
  assert.equal(result.status, 1);
  assert.match(output, /multiple JAAD configuration files/);
  assert.match(output, /jaad\.config\.ts, jaad\.config\.js/);
  assert.deepEqual(snapshotFiles(project), before);
});

test("non-interactive requests are complete before files are written", () => {
  const cases = [
    {
      name: "missing answers",
      args: ["project", "--title", "Incomplete", "--no-install"],
      message: /missing answers.*template/s,
      target: "project",
    },
    {
      name: "unknown template",
      args: [
        "project",
        "--template",
        "blog",
        "--title",
        "Invalid",
        "--no-install",
      ],
      message: /unknown template blog/,
      target: "project",
    },
    {
      name: "missing option value",
      args: ["project", "--template"],
      message: /--template needs a value/,
      target: "project",
    },
    {
      name: "conflicting install answers",
      args: [
        "project",
        "--template",
        "docs",
        "--title",
        "Conflict",
        "--install",
        "--no-install",
      ],
      message: /cannot be used together/,
      target: "project",
    },
  ];

  for (const scenario of cases) {
    const parent = temporaryDirectory(`jaad-invalid-${scenario.name}-`);
    const result = spawnSync("node", [CLI, ...scenario.args], {
      cwd: parent,
      encoding: "utf8",
    });
    assert.equal(result.status, 1, scenario.name);
    assert.match(`${result.stdout}\n${result.stderr}`, scenario.message);
    assert.equal(
      existsSync(join(parent, scenario.target)),
      false,
      `${scenario.name} wrote files`,
    );
  }
});
