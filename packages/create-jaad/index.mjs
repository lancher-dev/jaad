#!/usr/bin/env node
import * as p from "@clack/prompts";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { styleText } from "node:util";

// Bumped together with the package they install.
const JAAD = "^0.8.2";
const ASTRO = "^7.3.1";
const TEMPLATES = ["docs", "site"];
const DEFAULT_TEMPLATE = "docs";
const ASTRO_CONFIG_NAMES = [
  "astro.config.ts",
  "astro.config.mjs",
  "astro.config.js",
];
const CONTENT_CONFIG_NAMES = [
  "src/content.config.ts",
  "src/content.config.mjs",
  "src/content.config.js",
];
const JAAD_CONFIG_NAMES = [
  "jaad.config.ts",
  "jaad.config.mjs",
  "jaad.config.js",
];
const ASTRO_CONFIG = 'export { default } from "@lancher-dev/jaad/site";\n';
const CONTENT_CONFIG =
  'export { collections } from "@lancher-dev/jaad/content";\n';
const MANUAL_SETUP_URL =
  "https://jaad.lancher.dev/docs/getting-started/installation#existing-astro-project";
const INDEX_PAGE_NAMES = [
  "index.astro",
  "index.md",
  "index.mdx",
  "index.html",
  "index.js",
  "index.ts",
];
const FAVICON_NAMES = ["favicon.svg", "favicon.ico", "favicon.png"];

const HELP = `Usage: npm create @lancher-dev/jaad@latest [directory] [options]

  --here                    Set up JAAD in the current directory.
  --template <docs|site>    Docs at / (default), or a landing page with
                            docs at /docs.
  --title <title>           Site title.
  --install                 Install dependencies.
  --no-install              Write the files and stop.
  -h, --help                Show this.
`;

function fail(message) {
  throw new Error(`create-jaad: ${message}`);
}

function takeValue(argv, index, option) {
  const value = argv[index + 1];
  if (!value || value.startsWith("-")) fail(`${option} needs a value.`);
  return value;
}

function parseArgs(argv) {
  const args = {
    here: false,
    install: null,
    template: null,
    title: null,
    dir: null,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--here") args.here = true;
    else if (arg === "--template") args.template = takeValue(argv, i++, arg);
    else if (arg === "--title") args.title = takeValue(argv, i++, arg);
    else if (arg === "--install") {
      if (args.install === false) {
        fail("--install and --no-install cannot be used together.");
      }
      args.install = true;
    } else if (arg === "--no-install") {
      if (args.install === true) {
        fail("--install and --no-install cannot be used together.");
      }
      args.install = false;
    } else if (arg === "-h" || arg === "--help") args.help = true;
    else if (arg.startsWith("-")) fail(`unknown option ${arg}.`);
    else if (args.dir) fail("only one directory can be provided.");
    else args.dir = arg;
  }

  if (args.here && args.dir) {
    fail("--here cannot be used together with a directory.");
  }
  // A path naming the current directory is --here.
  if (args.dir && resolve(args.dir) === resolve(".")) {
    args.here = true;
    args.dir = null;
  }
  if (args.template && !TEMPLATES.includes(args.template)) {
    fail(
      `unknown template ${args.template}; available: ${TEMPLATES.join(", ")}.`,
    );
  }

  return args;
}

/** Quotes a path for the commands we print. */
const quoteArg = (value) =>
  /^[\w./@-]+$/.test(value)
    ? value
    : `"${value.replace(/(["\\$`])/g, "\\$1")}"`;

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

// Resolved against this file: `npm create` runs the bin from a cache.
const templateRoot = (template) =>
  join(import.meta.dirname, "templates", template);

// npm strips `.gitignore` from published tarballs, so it ships renamed.
const TEMPLATE_RENAMES = {
  _gitignore: ".gitignore",
};

function templateFiles(root, prefix = "") {
  const entries = readdirSync(join(root, prefix), { withFileTypes: true }).sort(
    (a, b) => a.name.localeCompare(b.name),
  );
  return entries.flatMap((entry) => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    return entry.isDirectory() ? templateFiles(root, relative) : [relative];
  });
}

/** Replaces the whole literal, so the title keeps its JSON escaping. */
const withTitle = (source, title) =>
  source.replaceAll('"__JAAD_TITLE__"', JSON.stringify(title));

const manifestPath = (target) => join(target, "package.json");

function readManifest(target) {
  const file = manifestPath(target);
  if (!existsSync(file)) return { manifest: null, issue: null };

  let manifest;
  try {
    manifest = JSON.parse(readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
  } catch {
    return {
      manifest: null,
      issue: "package.json is not valid JSON",
    };
  }

  if (!isRecord(manifest)) {
    return {
      manifest: null,
      issue: "package.json must contain a JSON object",
    };
  }

  for (const key of ["scripts", "dependencies", "devDependencies"]) {
    if (key in manifest && !isRecord(manifest[key])) {
      return {
        manifest: null,
        issue: `package.json field ${key} must contain an object`,
      };
    }
  }

  return { manifest, issue: null };
}

const isRecord = (value) =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normaliseSource = (source) => source.replace(/\r\n/g, "\n").trim();

function existingFiles(target, names) {
  return names.filter((name) => existsSync(join(target, name)));
}

function inspectConfig(target, names, canonical, label, issues) {
  const files = existingFiles(target, names);
  if (files.length > 1) {
    issues.push(`multiple ${label} files found: ${files.join(", ")}`);
    return null;
  }

  const file = files[0] ?? null;
  if (
    file &&
    canonical !== null &&
    normaliseSource(readFileSync(join(target, file), "utf8")) !==
      normaliseSource(canonical)
  ) {
    issues.push(`${file} contains a custom ${label}`);
  }
  return file;
}

function failSetup(issues) {
  fail(
    `cannot safely update this project:\n${issues.map((item) => `  - ${item}`).join("\n")}\n` +
      `No files were changed. Integrate JAAD manually: ${MANUAL_SETUP_URL}`,
  );
}

/** Inspect everything before writing: a failed --here setup is a no-op. */
function inspectExistingProject(target) {
  const issues = [];
  const { manifest, issue: manifestIssue } = readManifest(target);
  if (manifestIssue) issues.push(manifestIssue);

  const astroConfig = inspectConfig(
    target,
    ASTRO_CONFIG_NAMES,
    ASTRO_CONFIG,
    "Astro configuration",
    issues,
  );
  const contentConfig = inspectConfig(
    target,
    CONTENT_CONFIG_NAMES,
    CONTENT_CONFIG,
    "content configuration",
    issues,
  );
  const jaadConfig = inspectConfig(
    target,
    JAAD_CONFIG_NAMES,
    null,
    "JAAD configuration",
    issues,
  );

  if (issues.length > 0) failSetup(issues);

  return { manifest, astroConfig, contentConfig, jaadConfig };
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
  const dependencies = { ...manifest.dependencies };
  if (
    !("astro" in dependencies) &&
    !("astro" in (manifest.devDependencies ?? {}))
  ) {
    dependencies.astro = ASTRO;
  }
  if (
    !("@lancher-dev/jaad" in dependencies) &&
    !("@lancher-dev/jaad" in (manifest.devDependencies ?? {}))
  ) {
    dependencies["@lancher-dev/jaad"] = JAAD;
  }
  if (Object.keys(dependencies).length > 0)
    manifest.dependencies = dependencies;

  writeFileSync(manifestPath(target), JSON.stringify(manifest, null, 2) + "\n");
}

function packageManager() {
  const agent = process.env.npm_config_user_agent ?? "";
  for (const name of ["pnpm", "yarn", "bun"]) {
    if (agent.startsWith(name)) return name;
  }
  return "npm";
}

function answer(value) {
  if (p.isCancel(value)) {
    p.cancel("Setup cancelled.");
    return null;
  }
  return value;
}

const IGNORED_WHEN_EMPTY = [".git", ".gitignore", ".DS_Store", "Thumbs.db"];

function assertTargetAvailable(args, target) {
  if (args.here || !existsSync(target)) return;

  const entries = readdirSync(target).filter(
    (entry) => !IGNORED_WHEN_EMPTY.includes(entry),
  );
  if (entries.length > 0) {
    fail(`${args.dir} exists and is not empty. Use --here to add JAAD to it.`);
  }
}

function missingAnswers(args) {
  const missing = [];
  if (!args.here && !args.dir)
    missing.push("directory ([directory] or --here)");
  if (!args.title) missing.push("title (--title <title>)");
  if (args.install === null) {
    missing.push("installation (--install or --no-install)");
  }
  return missing;
}

async function collectAnswers(args) {
  const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY);
  if (!interactive) {
    const missing = missingAnswers(args);
    if (missing.length > 0) {
      fail(`missing answers in non-interactive mode: ${missing.join(", ")}.`);
    }
  }

  if (interactive) {
    process.stdout.write("\n");
    p.intro(
      `📚 ${styleText("cyan", "JAAD", { stream: process.stdout })} · Just Another Astro Docs — Write markdown. Get docs.`,
    );
  }

  if (!args.here && !args.dir) {
    const dir = answer(
      await p.text({
        message: "Where should we create the project?",
        placeholder: ".",
        defaultValue: ".",
      }),
    );
    if (dir === null) return null;
    args.dir = dir;
    if (args.dir === ".") args.here = true;
  }

  const target = resolve(args.here ? "." : args.dir);
  assertTargetAvailable(args, target);

  const existing = args.here
    ? inspectExistingProject(target)
    : {
        manifest: null,
        astroConfig: null,
        contentConfig: null,
        jaadConfig: null,
      };
  const manifest = existing.manifest;

  if (!args.template && !interactive) args.template = DEFAULT_TEMPLATE;

  if (!args.template) {
    const template = answer(
      await p.select({
        message: "What are you building?",
        initialValue: "docs",
        options: [
          {
            value: "docs",
            label: "Documentation site",
            hint: "docs at /",
          },
          {
            value: "site",
            label: "Website with documentation",
            hint: "landing page at /, docs at /docs",
          },
        ],
      }),
    );
    if (template === null) return null;
    args.template = template;
  }

  if (args.template === "site" && existing.jaadConfig) {
    failSetup([
      `${existing.jaadConfig} already configures JAAD, so the site template ` +
        'cannot add a landing page: it needs routeBase: "/docs"',
    ]);
  }

  const suggested =
    typeof manifest?.name === "string" && manifest.name
      ? titleFrom(manifest.name)
      : titleFrom(basename(target));

  if (!args.title) {
    const title = answer(
      await p.text({
        message: "Site title",
        placeholder: suggested,
        defaultValue: suggested,
      }),
    );
    if (title === null) return null;
    args.title = title;
  }

  if (args.install === null) {
    const install = answer(
      await p.confirm({
        message: `Install dependencies now?`,
        initialValue: true,
      }),
    );
    if (install === null) return null;
    args.install = install;
  }

  return { ...args, target, manifest, existing };
}

function scaffold(request) {
  const { target, manifest, title, template, existing } = request;
  mkdirSync(target, { recursive: true });

  const written = [];
  const skipped = [];

  if (existing.astroConfig) skipped.push(existing.astroConfig);
  else write(target, "astro.config.mjs", ASTRO_CONFIG, written, skipped);

  if (existing.contentConfig) skipped.push(existing.contentConfig);
  else {
    write(target, "src/content.config.ts", CONTENT_CONFIG, written, skipped);
  }

  const ownsRoot = INDEX_PAGE_NAMES.some((name) =>
    existsSync(join(target, "src", "pages", name)),
  );
  const found = markdownUnder(join(target, "docs"));
  // JAAD prefers the .svg, so ours would quietly outrank an existing icon.
  const hasFavicon = FAVICON_NAMES.some((name) =>
    existsSync(join(target, "public", name)),
  );

  const root = templateRoot(template);
  for (const relative of templateFiles(root)) {
    if (relative === "jaad.config.ts" && existing.jaadConfig) {
      skipped.push(existing.jaadConfig);
      continue;
    }
    if (relative.startsWith("src/") && ownsRoot) continue;
    if (relative.startsWith("docs/") && found > 0) continue;
    if (relative === "public/favicon.svg" && hasFavicon) continue;

    const source = readFileSync(join(root, relative), "utf8");
    const destination = TEMPLATE_RENAMES[relative] ?? relative;
    write(target, destination, withTitle(source, title), written, skipped);
  }

  writeManifest(target, manifest, basename(target));
  return { written, skipped, found };
}

async function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
    if (args.help) return console.log(HELP);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
    return;
  }

  let request;
  try {
    request = await collectAnswers(args);
  } catch (error) {
    p.log.error(error.message);
    process.exitCode = 1;
    return;
  }
  if (!request) {
    process.exitCode = 1;
    return;
  }

  let result;
  try {
    result = scaffold(request);
  } catch (error) {
    p.log.error(`could not write the project: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  const { written, skipped, found } = result;
  p.log.success(request.title);
  p.log.step(
    [
      ...written.map((file) => `created  ${file}`),
      "updated  package.json",
    ].join("\n"),
  );

  const kept = [
    ...skipped.map((file) => `kept     ${file}`),
    ...(found > 0 ? [`found    ${found} markdown file(s) in docs/`] : []),
  ];
  if (kept.length > 0) p.log.info(kept.join("\n"));

  const pm = packageManager();
  if (request.install) {
    const installed = spawnSync(pm, ["install"], {
      cwd: request.target,
      stdio: "inherit",
      // npm and pnpm are .cmd shims on Windows.
      shell: process.platform === "win32",
    });
    if (installed.status !== 0) {
      p.log.error(
        installed.error
          ? `could not run ${pm}: ${installed.error.message}`
          : `${pm} install failed.`,
      );
      process.exitCode = 1;
      return;
    }
  }

  const next = [];
  if (!request.here) next.push(`cd ${quoteArg(request.dir)}`);
  if (!request.install) next.push(`${pm} install`);
  next.push(`${pm} run dev`);

  const start = written.includes("docs/01-introduction.md")
    ? "docs/01-introduction.md"
    : "docs/";
  p.note(`${next.join("\n")}\n\nStart writing in ${start}`, "Next steps");
  p.outro("Happy documenting! ✨");
}

await main();
