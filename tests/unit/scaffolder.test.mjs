import { test } from "node:test";
import assert from "node:assert/strict";
import { resolve } from "node:path";
import {
  missingAnswers,
  normaliseDir,
  packageManager,
  parseArgs,
  quoteArg,
  titleFrom,
} from "../../packages/create-jaad/lib.mjs";

// ── Arguments ────────────────────────────────────────────────────────────────

test("a bare directory is the target, and the rest keep their defaults", () => {
  const args = parseArgs(["my-docs"]);
  assert.equal(args.dir, "my-docs");
  assert.equal(args.here, false);
  assert.equal(args.install, null);
  assert.equal(args.template, null);
});

test("install and no-install contradict each other", () => {
  assert.throws(
    () => parseArgs(["--install", "--no-install"]),
    /cannot be used together/,
  );
  assert.throws(
    () => parseArgs(["--no-install", "--install"]),
    /cannot be used together/,
  );
});

test("an option that needs a value says so", () => {
  assert.throws(() => parseArgs(["--title"]), /--title needs a value/);
  assert.throws(() => parseArgs(["--title", "--here"]), /needs a value/);
});

test("an unknown template names the ones that exist", () => {
  assert.throws(() => parseArgs(["--template", "blog"]), /docs, site/);
});

test("--here and a directory are mutually exclusive", () => {
  assert.throws(() => parseArgs(["--here", "x"]), /cannot be used together/);
  assert.throws(() => parseArgs(["a", "b"]), /only one directory/);
});

// ── The current directory, however it is spelled ─────────────────────────────

// The prompt used to compare against "." alone, so answering "./" aborted with
// advice to use --here, which is what the answer meant.
test("every spelling of the current directory becomes --here", () => {
  for (const dir of [".", "./", ".//", resolve(".")]) {
    const args = normaliseDir({ dir, here: false });
    assert.equal(args.here, true, dir);
    assert.equal(args.dir, null, dir);
  }
});

test("a real directory is left alone", () => {
  const args = normaliseDir({ dir: "my-docs", here: false });
  assert.equal(args.here, false);
  assert.equal(args.dir, "my-docs");
});

test("the flag path normalises the same way", () => {
  assert.equal(parseArgs(["./"]).here, true);
  assert.equal(parseArgs(["./"]).dir, null);
});

// ── Presentation ─────────────────────────────────────────────────────────────

test("a package name becomes a title worth offering", () => {
  assert.equal(titleFrom("my-docs"), "My Docs");
  assert.equal(titleFrom("@acme/my-library"), "My Library");
  assert.equal(titleFrom("docs.site_name"), "Docs Site Name");
  assert.equal(titleFrom(""), "Documentation");
});

test("a path is quoted only when a shell would need it", () => {
  assert.equal(quoteArg("my-docs"), "my-docs");
  assert.equal(quoteArg("./a/b@c"), "./a/b@c");
  assert.equal(quoteArg("my docs"), '"my docs"');
  assert.equal(quoteArg('a"b'), '"a\\"b"');
});

test("the package manager comes from the agent that invoked us", () => {
  const agent = process.env.npm_config_user_agent;
  try {
    for (const [ua, expected] of [
      ["pnpm/10.0.0 npm/? node/v22", "pnpm"],
      ["yarn/4.0.0 npm/? node/v22", "yarn"],
      ["bun/1.0.0", "bun"],
      ["npm/10.0.0 node/v22", "npm"],
      ["", "npm"],
    ]) {
      process.env.npm_config_user_agent = ua;
      assert.equal(packageManager(), expected, ua);
    }
  } finally {
    if (agent === undefined) delete process.env.npm_config_user_agent;
    else process.env.npm_config_user_agent = agent;
  }
});

// ── Non-interactive completeness ─────────────────────────────────────────────

test("a non-interactive run is told everything it still needs", () => {
  const missing = missingAnswers({
    here: false,
    dir: null,
    title: null,
    install: null,
  });
  assert.equal(missing.length, 3);

  assert.deepEqual(
    missingAnswers({ here: true, dir: null, title: "T", install: false }),
    [],
  );
});
