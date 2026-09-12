import { resolve } from "node:path";

export const TEMPLATES = ["docs", "site"];
export const DEFAULT_TEMPLATE = "docs";

export const HELP = `Usage: npm create @lancher-dev/jaad@latest [directory] [options]

  --here                    Set up JAAD in the current directory.
  --template <docs|site>    Docs at / (default), or a landing page with
                            docs at /docs.
  --title <title>           Site title.
  --install                 Install dependencies.
  --no-install              Write the files and stop.
  -h, --help                Show this.
`;

export function fail(message) {
  throw new Error(`create-jaad: ${message}`);
}

function takeValue(argv, index, option) {
  const value = argv[index + 1];
  if (!value || value.startsWith("-")) fail(`${option} needs a value.`);
  return value;
}

/** A path naming the current directory is --here, however it was spelled. */
export function normaliseDir(args) {
  if (args.dir && resolve(args.dir) === resolve(".")) {
    args.here = true;
    args.dir = null;
  }
  return args;
}

export function parseArgs(argv) {
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
  normaliseDir(args);
  if (args.template && !TEMPLATES.includes(args.template)) {
    fail(
      `unknown template ${args.template}; available: ${TEMPLATES.join(", ")}.`,
    );
  }

  return args;
}

/** Quotes a path for the commands we print. */
export const quoteArg = (value) =>
  /^[\w./@-]+$/.test(value)
    ? value
    : `"${value.replace(/(["\\$`])/g, "\\$1")}"`;

/** "my-docs" becomes "My Docs", which is right often enough to offer. */
export const titleFrom = (name) =>
  name
    .replace(/^@[^/]+\//, "")
    .split(/[-_.\s]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ") || "Documentation";

export function packageManager() {
  const agent = process.env.npm_config_user_agent ?? "";
  for (const name of ["pnpm", "yarn", "bun"]) {
    if (agent.startsWith(name)) return name;
  }
  return "npm";
}

export function missingAnswers(args) {
  const missing = [];
  if (!args.here && !args.dir)
    missing.push("directory ([directory] or --here)");
  if (!args.title) missing.push("title (--title <title>)");
  if (args.install === null) {
    missing.push("installation (--install or --no-install)");
  }
  return missing;
}
