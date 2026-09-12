import { existsSync, readdirSync } from "node:fs";
import { ucfirst } from "./utils/helpers.ts";

/** ISO 639-1. A three-letter directory such as `api` is never a locale. */
const LANGUAGES = new Set(
  (
    "aa ab ae af ak am an ar as av ay az ba be bg bi bm bn bo br bs ca ce ch co " +
    "cr cs cu cv cy da de dv dz ee el en eo es et eu fa ff fi fj fo fr fy ga gd " +
    "gl gn gu gv ha he hi ho hr ht hu hy hz ia id ie ig ii ik io is it iu ja jv " +
    "ka kg ki kj kk kl km kn ko kr ks ku kv kw ky la lb lg li ln lo lt lu lv mg " +
    "mh mi mk ml mn mr ms mt my na nb nd ne ng nl nn no nr nv ny oc oj om or os " +
    "pa pi pl ps pt qu rm rn ro ru rw sa sc sd se sg si sk sl sm sn so sq sr ss " +
    "st su sv sw ta te tg th ti tk tl tn to tr ts tt tw ty ug uk ur uz ve vi vo " +
    "wa wo xh yi yo za zh zu"
  ).split(" "),
);

/** Region for a language that does not name one. Listed, never guessed: `aa`
 *  uppercased is not a country and would render an empty box. */
const LANGUAGE_REGION: Record<string, string> = {
  af: "ZA",
  am: "ET",
  ar: "SA",
  az: "AZ",
  be: "BY",
  bg: "BG",
  bn: "BD",
  bs: "BA",
  ca: "ES",
  cs: "CZ",
  cy: "GB",
  da: "DK",
  de: "DE",
  el: "GR",
  en: "GB",
  es: "ES",
  et: "EE",
  eu: "ES",
  fa: "IR",
  fi: "FI",
  fr: "FR",
  ga: "IE",
  gd: "GB",
  gl: "ES",
  gu: "IN",
  ha: "NG",
  he: "IL",
  hi: "IN",
  hr: "HR",
  hu: "HU",
  hy: "AM",
  id: "ID",
  ig: "NG",
  is: "IS",
  it: "IT",
  ja: "JP",
  jv: "ID",
  ka: "GE",
  kk: "KZ",
  km: "KH",
  kn: "IN",
  ko: "KR",
  ky: "KG",
  lo: "LA",
  lt: "LT",
  lv: "LV",
  mk: "MK",
  ml: "IN",
  mn: "MN",
  mr: "IN",
  ms: "MY",
  mt: "MT",
  my: "MM",
  nb: "NO",
  ne: "NP",
  nl: "NL",
  nn: "NO",
  no: "NO",
  pa: "IN",
  pl: "PL",
  ps: "AF",
  pt: "PT",
  ro: "RO",
  ru: "RU",
  si: "LK",
  sk: "SK",
  sl: "SI",
  so: "SO",
  sq: "AL",
  sr: "RS",
  su: "ID",
  sv: "SE",
  sw: "TZ",
  ta: "IN",
  te: "IN",
  tg: "TJ",
  th: "TH",
  tk: "TM",
  tl: "PH",
  tr: "TR",
  uk: "UA",
  ur: "PK",
  uz: "UZ",
  vi: "VN",
  yo: "NG",
  zh: "CN",
  zu: "ZA",
};

/** language[-Script][-REGION], lowercased: ids arrive slugged from the loader. */
const LOCALE_RE = /^([a-z]{2})(?:-([a-z]{4}))?(?:-([a-z]{2}))?$/;

export interface Locale {
  /** Lowercased directory name, and the URL segment. */
  code: string;
  /** BCP-47, for `lang` and `hreflang`. */
  tag: string;
  /** Native name, for the switcher menu. */
  name: string;
  /** Emoji, or null for a language with no listed region. */
  flag: string | null;
}

export function isLocale(segment: string): boolean {
  const match = LOCALE_RE.exec(segment.toLowerCase());
  return match !== null && LANGUAGES.has(match[1]);
}

/** "pt-br" becomes "pt-BR", "zh-hans" becomes "zh-Hans". */
export function localeTag(code: string): string {
  const match = LOCALE_RE.exec(code.toLowerCase());
  if (!match) return code;
  const [, language, script, region] = match;
  return [language, script && ucfirst(script), region && region.toUpperCase()]
    .filter(Boolean)
    .join("-");
}

function localeName(tag: string): string {
  try {
    const names = new Intl.DisplayNames([tag], { type: "language" });
    return ucfirst(names.of(tag) ?? tag);
  } catch {
    return tag;
  }
}

/** Regional indicators, A at U+1F1E6. */
function localeFlag(code: string): string | null {
  const match = LOCALE_RE.exec(code.toLowerCase());
  if (!match) return null;
  const region = match[3]?.toUpperCase() ?? LANGUAGE_REGION[match[1]];
  if (!region) return null;
  return String.fromCodePoint(
    ...[...region].map((letter) => 0x1f1e6 + letter.charCodeAt(0) - 65),
  );
}

export function describeLocale(code: string): Locale {
  const tag = localeTag(code);
  return { code, tag, name: localeName(tag), flag: localeFlag(code) };
}

/** Locale directories under docs/, or none. Two is the threshold: a lone
 *  `docs/it/` is a chapter, which is what an "IT" section relies on. */
export function detectLocales(docsDir: string): string[] {
  if (!existsSync(docsDir)) return [];

  const locales = readdirSync(docsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && isLocale(entry.name))
    .map((entry) => entry.name.toLowerCase())
    .sort();

  return locales.length >= 2 ? locales : [];
}

/** Once localised, every top-level entry is a locale and `lang` names one. */
export function validateLocaleTree(
  docsDir: string,
  locales: string[],
  lang: string,
): void {
  const issues: string[] = [];

  const strays = readdirSync(docsDir, { withFileTypes: true })
    .filter((entry) => !(entry.isDirectory() && isLocale(entry.name)))
    .map((entry) => entry.name)
    .sort();

  for (const stray of strays) {
    issues.push(`docs/${stray} is not a locale, but ${locales.join(", ")} are`);
  }

  if (!locales.includes(lang.toLowerCase())) {
    issues.push(
      `lang is "${lang}", which has no directory; found ${locales.join(", ")}`,
    );
  }

  if (issues.length > 0) {
    throw new Error(
      `jaad: mixed documentation tree\n${issues.map((issue) => `  ${issue}`).join("\n")}\n` +
        "Move every page under a locale directory, or set locales: false.",
    );
  }
}
