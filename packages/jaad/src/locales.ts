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
  // A group that did not participate is undefined, whatever the type says.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const region = match[3]?.toUpperCase() ?? LANGUAGE_REGION[match[1]];
  if (!region) return null;
  return String.fromCodePoint(
    ...Array.from(region, (letter) => 0x1f1e6 + letter.charCodeAt(0) - 65),
  );
}

export function describeLocale(code: string): Locale {
  const tag = localeTag(code);
  return { code, tag, name: localeName(tag), flag: localeFlag(code) };
}

/** Empty for the locale that owns the unprefixed urls. */
export function localeSegment(locale?: string, defaultLocale?: string): string {
  return !locale || locale === defaultLocale ? "" : locale;
}

/** The segment a generated slug carries, with its separator. */
export function localePrefix(locale?: string, defaultLocale?: string): string {
  const segment = localeSegment(locale, defaultLocale);
  return segment ? `${segment}/` : "";
}

/** What to iterate when building: every locale, or one unlocalised pass. */
export function routedLocales(locales: Locale[]): (string | undefined)[] {
  return locales.length > 0 ? locales.map((l) => l.code) : [undefined];
}

/** The locale codes whose urls carry a prefix. */
export function prefixedLocales(
  locales: Locale[],
  defaultLocale: string,
): string[] {
  return locales
    .map((locale) => locale.code)
    .filter((code) => localeSegment(code, defaultLocale) !== "");
}
