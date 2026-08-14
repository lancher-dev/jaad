#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { createInterface } from "node:readline/promises";

// Bumped together with the package they install.
const JAAD = "^0.1.1";
const ASTRO = "^7.2.0";

const HELP = `Usage: npm create jaad@latest [directory] [options]

  --here            Add JAAD to the current directory instead of a new one.
  --title <title>   Site title. Defaults to the directory name.
  --no-install      Write the files and stop.
  -h, --help        Show this.
`;

function parseArgs(argv) {
  const args = { here: false, install: null, title: null, dir: null };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--here") args.here = true;
    else if (arg === "--title") args.title = argv[++i];
    else if (arg === "--no-install") args.install = false;
    else if (arg === "-h" || arg === "--help") args.help = true;
    else if (!arg.startsWith("-")) args.dir ??= arg;
  }

  return args;
}

/** "my-docs" becomes "My Docs", which is right often enough to offer. */
const titleFrom = (name) =>
  name
    .replace(/^@[^/]+\//, "")
    .split(/[-_.\s]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ") || "Documentation";

function markdownUnder(dir) {
  if (!existsSync(dir)) return 0;
  return readdirSync(dir, { withFileTypes: true }).reduce(
    (count, entry) =>
      count +
      (entry.isDirectory()
        ? markdownUnder(join(dir, entry.name))
        : entry.name.endsWith(".md")
          ? 1
          : 0),
    0,
  );
}

/** Never overwrites: an existing file is the user's, not ours. */
function write(target, relative, contents, written, skipped) {
  const file = join(target, relative);
  if (existsSync(file)) {
    skipped.push(relative);
    return;
  }
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, contents);
  written.push(relative);
}

const manifestPath = (target) => join(target, "package.json");

function readManifest(target) {
  const file = manifestPath(target);
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

/**
 * Adds what is missing rather than replacing. `type` is set only on a manifest
 * we create: adding it to someone's library would change how Node reads every
 * file in it, and `astro.config.mjs` is ESM either way.
 */
function writeManifest(target, existing, name) {
  const manifest = existing ?? { name, private: true, type: "module" };

  manifest.scripts = {
    dev: "astro dev",
    build: "astro build",
    preview: "astro preview",
    ...manifest.scripts,
  };
  manifest.dependencies = {
    ...manifest.dependencies,
    astro: manifest.dependencies?.astro ?? ASTRO,
    "@lancher-dev/jaad": manifest.dependencies?.["@lancher-dev/jaad"] ?? JAAD,
  };

  writeFileSync(manifestPath(target), JSON.stringify(manifest, null, 2) + "\n");
}

function packageManager() {
  const agent = process.env.npm_config_user_agent ?? "";
  for (const name of ["pnpm", "yarn", "bun"]) {
    if (agent.startsWith(name)) return name;
  }
  return "npm";
}

async function ask(question, fallback) {
  if (!process.stdin.isTTY) return fallback;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = (await rl.question(question)).trim();
    return answer || fallback;
  } finally {
    rl.close();
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) return console.log(HELP);

  if (!args.here && !args.dir) {
    args.dir = await ask("Directory (. for the current one): ", ".");
    if (args.dir === ".") args.here = true;
  }

  const target = resolve(args.here ? "." : args.dir);
  if (!args.here && existsSync(target) && readdirSync(target).length > 0) {
    console.error(`create-jaad: ${args.dir} exists and is not empty.`);
    console.error("Use --here to add JAAD to a directory you already have.");
    process.exitCode = 1;
    return;
  }
  mkdirSync(target, { recursive: true });

  // In --here mode the manifest names the project better than the folder does.
  const manifest = readManifest(target);
  const suggested =
    typeof manifest?.name === "string" && manifest.name
      ? titleFrom(manifest.name)
      : titleFrom(basename(target));

  const title =
    args.title ?? (await ask(`Title (${suggested}): `, null)) ?? suggested;

  const written = [];
  const skipped = [];

  write(
    target,
    "astro.config.mjs",
    'export { default } from "@lancher-dev/jaad/site";\n',
    written,
    skipped,
  );
  write(
    target,
    "jaad.config.ts",
    `import { defineJaadConfig } from "@lancher-dev/jaad";\n\nexport default defineJaadConfig({\n  title: ${JSON.stringify(title)},\n});\n`,
    written,
    skipped,
  );
  write(
    target,
    "src/content.config.ts",
    'export { collections } from "@lancher-dev/jaad/content";\n',
    written,
    skipped,
  );

  // A repository that already has markdown is the reason --here exists.
  const found = markdownUnder(join(target, "docs"));
  if (found === 0) {
    write(
      target,
      "docs/01-introduction.md",
      "# Introduction\n\nWrite markdown in `docs/`. Numbers set the order and are stripped from the URL, folders become chapters, and the first heading becomes the page title.\n",
      written,
      skipped,
    );
  }

  writeManifest(target, manifest, basename(target));

  const pm = packageManager();
  console.log(`\n  ${title}\n`);
  for (const file of written) console.log(`  created  ${file}`);
  for (const file of skipped) console.log(`  kept     ${file}`);
  if (found > 0) {
    console.log(`  found    ${found} markdown file(s) in docs/`);
  }
  console.log("  updated  package.json");

  const install =
    args.install ??
    (await ask(`\nRun ${pm} install now? [Y/n] `, "y"))
      .toLowerCase()
      .startsWith("y");

  if (install) {
    console.log("");
    const result = spawnSync(pm, ["install"], {
      cwd: target,
      stdio: "inherit",
    });
    if (result.status !== 0) {
      console.error(`\ncreate-jaad: ${pm} install failed.`);
      process.exitCode = 1;
      return;
    }
  }

  const where = args.here ? "" : `cd ${args.dir} && `;
  console.log(
    `\n  ${where}${install ? "" : `${pm} install && `}${pm} run dev\n`,
  );
}

await main();
