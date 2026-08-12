import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PRESETS,
  PRESET_NAMES,
  isPreset,
} from "../../packages/jaad/src/themes/index.ts";
import { resolveConfig } from "../../packages/jaad/src/config.ts";

const THEMES = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../packages/jaad/src/themes",
);

test("every preset points at a stylesheet that exists", () => {
  for (const [name, preset] of Object.entries(PRESETS)) {
    if (preset.css === null) continue;
    assert.ok(
      existsSync(join(THEMES, preset.css)),
      `${name} declares ${preset.css}, which is not there`,
    );
  }
});

test("the default preset ships no stylesheet, so it changes nothing", () => {
  assert.equal(PRESETS.default.css, null);
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

test("isPreset agrees with the exported names", () => {
  for (const name of PRESET_NAMES) assert.ok(isPreset(name));
  assert.ok(!isPreset("nope"));
});
