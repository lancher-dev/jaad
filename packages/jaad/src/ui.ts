import { ENGLISH_UI } from "./ui/en.ts";
import { ITALIAN_UI } from "./ui/it.ts";

/** Every string JAAD puts on a page itself. */
export const UI_DEFAULTS = ENGLISH_UI;

export type UiKey = keyof typeof UI_DEFAULTS;
export type UiCatalog = Record<UiKey, string>;

export type UiOverrides = Record<string, Partial<Record<string, string>>>;

const UI_CATALOGS = {
  en: ENGLISH_UI,
  it: ITALIAN_UI,
} satisfies Record<string, UiCatalog>;

function localeCandidates(locale: string): string[] {
  const exact = locale.toLowerCase();
  const base = exact.split("-", 1)[0];
  return exact === base ? [exact] : [exact, base];
}

/** Locale keys in config are BCP-47 and therefore case-insensitive. */
function localeEntry<T>(entries: Record<string, T>, locale: string) {
  return Object.entries(entries).find(
    ([candidate]) => candidate.toLowerCase() === locale,
  )?.[1];
}

/** User overrides win, from the exact locale to its base language. Bundled
 *  catalogues follow the same order; English remains the final fallback. */
export function uiString(
  overrides: UiOverrides,
  locale: string,
  key: UiKey,
): string {
  const candidates = localeCandidates(locale);

  for (const candidate of candidates) {
    const value = localeEntry(overrides, candidate)?.[key];
    if (value !== undefined) return value;
  }

  for (const candidate of candidates) {
    const catalogue = localeEntry<UiCatalog>(UI_CATALOGS, candidate);
    if (catalogue) return catalogue[key];
  }

  return UI_DEFAULTS[key];
}

export const UI_KEYS = Object.keys(UI_DEFAULTS) as UiKey[];

/** Kept internal: consumers customise strings through `ui`. */
export const UI_SUPPORTED_LOCALES = Object.keys(UI_CATALOGS);
