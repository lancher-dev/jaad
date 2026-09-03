#!/usr/bin/env node
import * as p from "@clack/prompts";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { styleText } from "node:util";

// Bumped together with the package they install.
const JAAD = "^0.6.1";
const ASTRO = "^7.3.1";
const TEMPLATES = ["docs", "site"];

const HELP = `Usage: npm create @lancher-dev/jaad@latest [directory] [options]

  --here                    Add JAAD to the current directory.
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

  const manifest = readManifest(target);
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

  return { ...args, target, manifest };
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
import Layout from "@lancher-dev/jaad/layouts/Base.astro";

const title = ${JSON.stringify(title)};
---

<Layout>
  <section class="mx-auto max-w-2xl py-16 text-center">
    <h1 class="text-foreground-bright font-serif text-4xl font-semibold">
      {title}
    </h1>
    <p class="text-foreground-secondary mt-5 text-lg">
      Welcome. Start here, then explore the documentation.
    </p>
    <a
      href="/docs"
      class="bg-primary text-background hover:bg-primary-dark mt-8 inline-block rounded-sm px-6 py-3 font-medium no-underline transition-colors"
    >
      Read the documentation
    </a>
  </section>
</Layout>
`;
}

function scaffold(request) {
  const { target, manifest, title, template } = request;
  mkdirSync(target, { recursive: true });

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
    jaadConfig(title, template),
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

  if (template === "site") {
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
