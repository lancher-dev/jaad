import { test } from "node:test";
import assert from "node:assert/strict";
import { UI_DEFAULTS, UI_KEYS, uiString } from "../../packages/jaad/src/ui.ts";

test("a locale's override wins over the english default", () => {
  const overrides = { it: { "page.copy": "Copia la pagina" } };
  assert.equal(uiString(overrides, "it", "page.copy"), "Copia la pagina");
});

// Overriding one string must not blank the rest of that locale.
test("what a locale leaves out falls back, key by key", () => {
  const overrides = { it: { "page.copy": "Copia la pagina" } };
  assert.equal(
    uiString(overrides, "it", "page.edit"),
    UI_DEFAULTS["page.edit"],
  );
});

test("a locale with no overrides at all is the english default", () => {
  assert.equal(
    uiString({}, "fr", "search.trigger"),
    UI_DEFAULTS["search.trigger"],
  );
  assert.equal(
    uiString({ it: { home: "Inizio" } }, "en", "home"),
    UI_DEFAULTS.home,
  );
});

test("every key has a default, so nothing can render empty", () => {
  for (const key of UI_KEYS) {
    assert.ok(UI_DEFAULTS[key].length > 0, key);
  }
});
