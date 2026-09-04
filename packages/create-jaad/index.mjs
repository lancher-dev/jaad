#!/usr/bin/env node
import * as p from "@clack/prompts";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { styleText } from "node:util";

// Bumped together with the package they install.
const JAAD = "^0.7.0";
const ASTRO = "^7.3.1";
const TEMPLATES = ["docs", "site"];
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

const HELP = `Usage: npm create @lancher-dev/jaad@latest [directory] [options]

  --here                    Set up JAAD in the current directory.
  --template <docs|site>    Docs at /, or a landing page with docs at /docs.
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
  if (args.template && !TEMPLATES.includes(args.template)) {
    fail(
      `unknown template ${args.template}; available: ${TEMPLATES.join(", ")}.`,
    );
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
  if (!existsSync(file)) return { manifest: null, issue: null };

  let manifest;
  try {
    manifest = JSON.parse(readFileSync(file, "utf8"));
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

  if (issues.length > 0) {
    fail(
      `cannot safely update this project:\n${issues.map((item) => `  - ${item}`).join("\n")}\n` +
        `No files were changed. Integrate JAAD manually: ${MANUAL_SETUP_URL}`,
    );
  }

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

function assertTargetAvailable(args, target) {
  if (!args.here && existsSync(target) && readdirSync(target).length > 0) {
    fail(`${args.dir} exists and is not empty. Use --here to add JAAD to it.`);
  }
}

function missingAnswers(args) {
  const missing = [];
  if (!args.here && !args.dir)
    missing.push("directory ([directory] or --here)");
  if (!args.template) missing.push("template (--template docs|site)");
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

  const suggested =
    typeof manifest?.name === "string" && manifest.name
      ? titleFrom(manifest.name)
      : titleFrom(basename(target));

  if (!args.title) {
    const title = answer(
      await p.text({
        message: "Site title",
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

function jaadConfig(title, template) {
  const additions =
    template === "site"
      ? '\n  routeBase: "/docs",\n  nav: [{ label: "Docs", href: "/docs" }],'
      : "";
  return `import { defineJaadConfig } from "@lancher-dev/jaad";\n\nexport default defineJaadConfig({\n  title: ${JSON.stringify(title)},${additions}\n});\n`;
}

function landingPage(title) {
  return `---
import SiteLayout from "../layouts/SiteLayout.astro";

const title = ${JSON.stringify(title)};
const base = import.meta.env.BASE_URL.endsWith("/")
  ? import.meta.env.BASE_URL.slice(0, -1)
  : import.meta.env.BASE_URL;
const docsHref = base + "/docs";
---

<SiteLayout pageTitle="Home">
  <section class="hero">
    <h1>{title}</h1>
    <p>
      Welcome. Start here, then explore the documentation.
    </p>
    <a href={docsHref}>
      Read the documentation
    </a>
  </section>
</SiteLayout>
`;
}

function siteLayout(title) {
  return `---
interface Props {
  pageTitle?: string;
  description?: string;
}

const siteTitle = ${JSON.stringify(title)};
const {
  pageTitle,
  description = "A website with its own JAAD documentation.",
} = Astro.props;
const title = pageTitle ? \`\${pageTitle} | \${siteTitle}\` : siteTitle;
const base = import.meta.env.BASE_URL.endsWith("/")
  ? import.meta.env.BASE_URL.slice(0, -1)
  : import.meta.env.BASE_URL;
const homeHref = base + "/";
const docsHref = base + "/docs";
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <meta name="description" content={description} />
    <title>{title}</title>
  </head>
  <body>
    <header class="site-chrome site-header">
      <a class="site-name" href={homeHref}>{siteTitle}</a>
      <nav aria-label="Main navigation">
        <a href={docsHref}>Documentation</a>
      </nav>
    </header>
    <main><slot /></main>
    <footer class="site-chrome site-footer">Built with JAAD.</footer>
  </body>
</html>

<style is:global>
  :root {
    color-scheme: light;
    --color-background: #faf8f5;
    --color-surface: #ffffff;
    --color-foreground: #3a3a3a;
    --color-foreground-bright: #1a1a1a;
    --color-primary: #2d2d2d;
    --color-foreground-muted: color-mix(
      in oklab,
      var(--color-foreground) 55%,
      var(--color-background)
    );
    --color-foreground-secondary: color-mix(
      in oklab,
      var(--color-foreground) 72%,
      var(--color-background)
    );
    --color-border-dark: color-mix(
      in oklab,
      var(--color-foreground) 25%,
      var(--color-background)
    );
    --font-sans: Inter, ui-sans-serif, system-ui, sans-serif;
    --font-serif: Merriweather, Georgia, serif;
    --site-content-width: 56rem;
    --site-page-padding: 2rem;
  }

  * { box-sizing: border-box; }
  html {
    background: var(--color-background);
    color: var(--color-foreground);
    font-family: var(--font-sans);
  }
  body {
    display: flex;
    min-height: 100vh;
    flex-direction: column;
    margin: 0;
  }
  h1, h2, h3 {
    color: var(--color-foreground-bright);
    font-family: var(--font-serif);
  }
  a { color: var(--color-primary); }
  .site-chrome {
    width: 100%;
    max-width: var(--site-content-width);
    margin-inline: auto;
  }
  .site-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
  }
  .site-header nav a {
    color: var(--color-foreground-secondary);
    font-size: 0.875rem;
    text-decoration: none;
  }
  .site-header nav a:hover { color: var(--color-foreground-bright); }
  .site-name {
    font-family: var(--font-serif);
    font-size: 1.25rem;
    font-style: italic;
    font-weight: 300;
    line-height: 1;
    text-decoration: none;
  }
  main {
    width: 100%;
    max-width: var(--site-content-width);
    flex: 1;
    margin-inline: auto;
    padding-inline: var(--site-page-padding);
  }
  .hero {
    max-width: 44rem;
    margin: 7rem auto;
    text-align: center;
  }
  .hero h1 {
    margin: 0;
    font-size: clamp(2.5rem, 8vw, 5rem);
    font-weight: 600;
  }
  .hero p {
    margin: 1.5rem 0 2rem;
    color: var(--color-foreground-secondary);
    font-size: 1.125rem;
  }
  .hero a {
    display: inline-block;
    border-radius: 0.25rem;
    padding: 0.75rem 1.5rem;
    background: var(--color-primary);
    color: var(--color-background);
    text-decoration: none;
  }
  .site-footer {
    margin-top: 1rem;
    border-top: 1px solid var(--color-border-dark);
    padding: 0.5rem 1rem 0.25rem;
    color: var(--color-foreground-muted);
    font-size: 0.95rem;
    font-style: italic;
    line-height: 1.6;
    text-align: center;
  }
  @media (min-width: 1024px) {
    main { padding-inline: calc(var(--site-page-padding) * 2); }
  }
  @media (prefers-color-scheme: dark) {
    :root {
      color-scheme: dark;
      --color-background: #0d1117;
      --color-surface: #21262d;
      --color-foreground: #c9d1d9;
      --color-foreground-bright: #e6edf3;
      --color-primary: #c9d1d9;
      --color-foreground-muted: color-mix(
        in oklab,
        var(--color-foreground) 57%,
        var(--color-background)
      );
      --color-foreground-secondary: color-mix(
        in oklab,
        var(--color-foreground) 71%,
        var(--color-background)
      );
      --color-border-dark: color-mix(
        in oklab,
        var(--color-foreground) 36%,
        var(--color-background)
      );
    }
  }
</style>
`;
}

function scaffold(request) {
  const { target, manifest, title, template, existing } = request;
  mkdirSync(target, { recursive: true });

  const written = [];
  const skipped = [];

  if (existing.astroConfig) skipped.push(existing.astroConfig);
  else write(target, "astro.config.mjs", ASTRO_CONFIG, written, skipped);

  if (existing.jaadConfig) skipped.push(existing.jaadConfig);
  else {
    write(
      target,
      "jaad.config.ts",
      jaadConfig(title, template),
      written,
      skipped,
    );
  }

  if (existing.contentConfig) skipped.push(existing.contentConfig);
  else {
    write(target, "src/content.config.ts", CONTENT_CONFIG, written, skipped);
  }

  const ownsRoot = INDEX_PAGE_NAMES.some((name) =>
    existsSync(join(target, "src", "pages", name)),
  );

  if (template === "site" && !ownsRoot) {
    write(
      target,
      "src/layouts/SiteLayout.astro",
      siteLayout(title),
      written,
      skipped,
    );
    write(
      target,
      "src/pages/index.astro",
      landingPage(title),
      written,
      skipped,
    );
  }

  const found = markdownUnder(join(target, "docs"));
  if (found === 0) {
    const opening = template === "site" ? "/docs" : "/";
    write(
      target,
      "docs/01-introduction.md",
      `# Introduction\n\nWrite markdown in \`docs/\`. The first page opens at \`${opening}\`; numbers set the order and are stripped from later URLs, folders become chapters, and the first heading becomes the page title.\n`,
      written,
      skipped,
    );
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
  if (!request) return;

  const { written, skipped, found } = scaffold(request);
  p.log.success(request.title);
  for (const file of written) p.log.step(`created  ${file}`);
  for (const file of skipped) p.log.info(`kept     ${file}`);
  if (found > 0) p.log.info(`found    ${found} markdown file(s) in docs/`);
  p.log.step("updated  package.json");

  const pm = packageManager();
  if (request.install) {
    const result = spawnSync(pm, ["install"], {
      cwd: request.target,
      stdio: "inherit",
    });
    if (result.status !== 0) {
      p.log.error(`${pm} install failed.`);
      process.exitCode = 1;
      return;
    }
  }

  const next = [];
  if (!request.here) next.push(`cd ${request.dir}`);
  if (!request.install) next.push(`${pm} install`);
  next.push(`${pm} run dev`);

  const start = written.includes("docs/01-introduction.md")
    ? "docs/01-introduction.md"
    : "docs/";
  p.note(`${next.join("\n")}\n\nStart writing in ${start}`, "Next steps");
  p.outro("Happy documenting! ✨");
}

await main();
