import { getCollection } from "astro:content";
import type { DocsEntry } from "./@types/docs.ts";
import {
  getCleanSlug,
  routedId,
  sortDocPages,
  splitDocLocale,
  validateDocsStructure,
} from "./utils/docs.ts";
import { docsPageHref } from "./urls.ts";
import {
  DEFAULT_LOCALE,
  LOCALES,
  docsUrls,
  prefixedCodes,
} from "./docs-config.ts";
import type { Locale } from "./locales.ts";

const cached = new Map<string, DocsEntry[]>();
// Keyed on the array: the same object in production, a fresh one in dev.
const slugIndex = new WeakMap<DocsEntry[], Map<string, number>>();

function indexOfSlug(pages: DocsEntry[], slug: string): number {
  let index = slugIndex.get(pages);
  if (!index) {
    index = new Map(
      pages.map((page, at) => [getCleanSlug(routedId(page)), at]),
    );
    slugIndex.set(pages, index);
  }
  return index.get(slug) ?? -1;
}

const CODES = LOCALES.map((locale) => locale.code);

/** Attaches the locale and the id routing reads, leaving `id` the real
 *  collection id: the edit link points at the file on disk. */
function localise(page: DocsEntry): DocsEntry {
  if (CODES.length === 0) return page;
  const split = splitDocLocale(page.id, CODES);
  return { ...page, locale: split.locale ?? undefined, localeId: split.id };
}

/** The pages of one locale, or every page when the docs are not localised.
 *  Cached in production only: in dev the module would go stale on edit. */
export async function getSortedDocsPages(
  locale: string = DEFAULT_LOCALE,
): Promise<DocsEntry[]> {
  const key = CODES.length > 0 ? locale : "";
  if (import.meta.env.PROD && cached.has(key)) return cached.get(key)!;

  const pages = ((await getCollection("docsPages")) as unknown as DocsEntry[])
    .map(localise)
    .filter((page) => key === "" || page.locale === key);

  // Validated before filtering: a draft's slug conflict still surfaces in dev.
  validateDocsStructure(pages, key || undefined);
  const sorted = sortDocPages(
    import.meta.env.PROD ? pages.filter((page) => !page.data.draft) : pages,
  );
  if (import.meta.env.PROD) cached.set(key, sorted);
  return sorted;
}

export interface LocaleAlternate {
  locale: Locale;
  href: string;
  /** False when this locale has no such page and the href is its opening one. */
  translated: boolean;
}

/** Where a page lives in every locale. An untranslated page falls back to that
 *  locale's opening page, which is where the switcher should land. */
export async function getLocaleAlternates(
  slug: string,
): Promise<LocaleAlternate[]> {
  const alternates: LocaleAlternate[] = [];

  for (const locale of LOCALES) {
    const pages = await getSortedDocsPages(locale.code);
    // Every page drafted leaves a locale with nothing to link to.
    if (pages.length === 0) continue;

    const index = slug ? indexOfSlug(pages, slug) : 0;
    const match = index >= 0 ? pages[index] : undefined;

    alternates.push({
      locale,
      translated: Boolean(match),
      href: docsPageHref(
        match && index > 0 ? getCleanSlug(routedId(match)) : "",
        docsUrls(locale.code),
      ),
    });
  }

  return alternates;
}

/** The prefixed locales that have something to serve. */
export async function getServedLocales(): Promise<string[]> {
  const served: string[] = [];

  for (const code of prefixedCodes()) {
    const pages = await getSortedDocsPages(code);
    if (pages.length > 0) served.push(code);
  }

  return served;
}
