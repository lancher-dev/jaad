import { getCollection } from "astro:content";
import config from "virtual:jaad/config";
import type { DocsEntry } from "./@types/docs.ts";
import {
  getCleanSlug,
  routedId,
  sortDocPages,
  splitDocLocale,
  validateDocsStructure,
} from "./utils/docs.ts";
import { docsPageHref } from "./urls.ts";
import type { Locale } from "./locales.ts";

const cached = new Map<string, DocsEntry[]>();

const LOCALES = config.docsLocales.map((locale) => locale.code);

/** Attaches the locale and the id routing reads, leaving `id` the real
 *  collection id: the edit link points at the file on disk. */
function localise(page: DocsEntry): DocsEntry {
  if (LOCALES.length === 0) return page;
  const split = splitDocLocale(page.id, LOCALES);
  return { ...page, locale: split.locale ?? undefined, localeId: split.id };
}

/** The pages of one locale, or every page when the docs are not localised.
 *  Cached in production only: in dev the module would go stale on edit. */
export async function getSortedDocsPages(
  locale: string = config.defaultLocale,
): Promise<DocsEntry[]> {
  const key = LOCALES.length > 0 ? locale : "";
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

  for (const locale of config.docsLocales) {
    const pages = await getSortedDocsPages(locale.code);
    const index = slug
      ? pages.findIndex((page) => getCleanSlug(routedId(page)) === slug)
      : 0;
    const match = index >= 0 ? pages[index] : undefined;

    alternates.push({
      locale,
      translated: Boolean(match),
      href: docsPageHref(
        match && index > 0 ? getCleanSlug(routedId(match)) : "",
        {
          docsBase: config.docsBase,
          deploymentBase: import.meta.env.BASE_URL,
          locale: locale.code,
          defaultLocale: config.defaultLocale,
        },
      ),
    });
  }

  return alternates;
}
