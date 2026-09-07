import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PRESETS } from "../../packages/jaad/src/themes/index.ts";
import {
  resolveConfig,
  resolveStylesheets,
} from "../../packages/jaad/src/config.ts";

const THEMES = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../packages/jaad/src/themes",
);

test("every preset resolves to a stylesheet JAAMD actually ships", () => {
  for (const name of Object.keys(PRESETS)) {
    if (PRESETS[name].theme === null) continue;
    const { theme } = resolveStylesheets(
      resolveConfig({ title: "T", theme: name }, "/"),
      "/",
    );
    assert.ok(theme && existsSync(theme), `${name} points at ${theme}`);
  }
});

test("the default preset ships no stylesheet, so it changes nothing", () => {
  assert.equal(PRESETS.default.theme, null);
});

test("a preset flips the bridge, so the palette travels from JAAMD", () => {
  const config = (theme: string) => resolveConfig({ title: "T", theme }, "/");
  const withPreset = resolveStylesheets(config("dracula"), "/");
  const without = resolveStylesheets(config("default"), "/");

  assert.match(withPreset.bridge, /jaamd-reverse\.css$/);
  assert.match(without.bridge, /jaamd-forward\.css$/);
  assert.ok(withPreset.theme, "a preset must resolve a stylesheet");
  assert.equal(without.theme, null);
});

// The two directions are a cycle if both load, and CSS drops both sides of one.
test("the two bridges never declare the same custom property", () => {
  const declared = (name: string) =>
    new Set(
      [
        ...readFileSync(join(THEMES, "../styles", name), "utf8").matchAll(
          /^\s*(--[a-z0-9-]+):/gm,
        ),
      ].map((m) => m[1]),
    );

  const forward = declared("jaamd-forward.css");
  const reverse = declared("jaamd-reverse.css");
  const both = [...forward].filter((token) => reverse.has(token));

  assert.deepEqual(both, [], "a token written by both bridges would cycle");
});

// global.css derives everything else from these with color-mix().
test("the reverse bridge covers every seed global.css expects", () => {
  const css = readFileSync(join(THEMES, "../styles/jaamd-reverse.css"), "utf8");

  for (const seed of [
    "--color-background",
    "--color-surface",
    "--color-foreground",
    "--color-foreground-bright",
    "--color-primary",
    "--color-info",
    "--color-success",
    "--color-warning",
    "--color-error",
  ]) {
    assert.match(css, new RegExp(`^\\s*${seed}:`, "m"), `${seed} is missing`);
  }
});

test("a preset name resolves to its shiki theme", () => {
  assert.equal(
    resolveConfig({ title: "T", theme: "dracula" }, "/").shiki,
    "dracula",
  );
  assert.deepEqual(resolveConfig({ title: "T" }, "/").shiki, {
    light: "github-light",
    dark: "github-dark",
  });
});

test("an explicit pair bypasses the presets", () => {
  assert.deepEqual(
    resolveConfig({ title: "T", theme: { light: "a", dark: "b" } }, "/").shiki,
    { light: "a", dark: "b" },
  );
});

test("an unknown theme is a build error, not a silent fallback", () => {
  assert.throws(
    () => resolveConfig({ title: "T", theme: "solarized" }, "/"),
    (e: Error) => /unknown theme/.test(String(e)) && /dracula/.test(String(e)),
  );
});

test("every preset names shiki themes that shiki actually bundles", () => {
  // shiki is a transitive dependency of astro, so it is not resolvable from
  // here; read the bundled theme files instead.
  const pnpm = join(THEMES, "../../../../node_modules/.pnpm");
  const dir = readdirSync(pnpm)
    .filter((d) => d.startsWith("@shikijs+themes@"))
    .map((d) => join(pnpm, d, "node_modules/@shikijs/themes/dist"))
    .find(existsSync);
  assert.ok(dir, "shiki themes not found; has the dependency moved?");

  const known = new Set(
    readdirSync(dir)
      .filter((f) => f.endsWith(".mjs") && !f.endsWith(".d.mts"))
      .map((f) => f.replace(/\.mjs$/, "")),
  );

  for (const [name, preset] of Object.entries(PRESETS)) {
    const ids =
      typeof preset.shiki === "string"
        ? [preset.shiki]
        : [preset.shiki.light, preset.shiki.dark];
    for (const id of ids) {
      assert.ok(
        known.has(id),
        `${name} asks for "${id}", which shiki does not have`,
      );
    }
  }
});
