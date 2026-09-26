import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveConfig } from "../../packages/jaad/src/config.ts";
import {
  UI_DEFAULTS,
  UI_KEYS,
  UI_SUPPORTED_LOCALES,
  uiString,
} from "../../packages/jaad/src/ui.ts";
import { ITALIAN_UI } from "../../packages/jaad/src/ui/it.ts";

test("a locale's override wins over its bundled catalogue", () => {
  const overrides = { it: { "page.copy": "Copia la pagina" } };
  assert.equal(uiString(overrides, "it", "page.copy"), "Copia la pagina");
});

// Overriding one string must not replace the rest of the bundled catalogue.
test("what a locale leaves out uses its bundled translation, key by key", () => {
  const overrides = { it: { "page.copy": "Copia la pagina" } };
  assert.equal(uiString(overrides, "it", "page.edit"), ITALIAN_UI["page.edit"]);
});

test("a supported locale needs no overrides", () => {
  assert.equal(
    uiString({}, "it", "search.trigger"),
    ITALIAN_UI["search.trigger"],
  );
});

test("an unsupported locale falls back to the english default", () => {
  assert.equal(
    uiString({}, "fr", "search.trigger"),
    UI_DEFAULTS["search.trigger"],
  );
  assert.equal(
    uiString({ it: { home: "Inizio" } }, "en", "home"),
    UI_DEFAULTS.home,
  );
});

test("regional locales fall back to their base language, case-insensitively", () => {
  assert.equal(uiString({}, "it-IT", "page.copy"), ITALIAN_UI["page.copy"]);
  assert.equal(uiString({}, "IT-ch", "page.copy"), ITALIAN_UI["page.copy"]);
});

test("exact and base overrides precede bundled catalogues", () => {
  const overrides = {
    IT: { home: "Inizio" },
    "it-IT": { home: "Partenza" },
  };

  assert.equal(uiString(overrides, "it-IT", "home"), "Partenza");
  assert.equal(uiString(overrides, "it-CH", "home"), "Inizio");
  assert.equal(
    uiString(overrides, "it-IT", "page.edit"),
    ITALIAN_UI["page.edit"],
  );
});

test("unlocalised docs use the lang override as their default locale", () => {
  const config = resolveConfig(
    {
      title: "T",
      lang: "it",
    },
    "/",
  );

  assert.deepEqual(config.docsLocales, []);
  assert.equal(config.defaultLocale, "it");
  assert.equal(
    uiString(config.ui, config.defaultLocale, "page.copy"),
    ITALIAN_UI["page.copy"],
  );
});

test("every bundled catalogue is complete and non-empty", () => {
  assert.deepEqual(UI_SUPPORTED_LOCALES, ["en", "it"]);
  assert.deepEqual(Object.keys(ITALIAN_UI), UI_KEYS);

  for (const key of UI_KEYS) {
    assert.ok(UI_DEFAULTS[key].length > 0, key);
    assert.ok(ITALIAN_UI[key].length > 0, `it.${key}`);
  }
});
