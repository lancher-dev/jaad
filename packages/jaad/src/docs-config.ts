import config from "virtual:jaad/config";
import type { Locale } from "./locales.ts";
import { prefixedLocales, routedLocales, type DocsUrlOptions } from "./urls.ts";

/** The virtual config arrives serialised, so it is read once and typed here
 *  rather than dotted into from every component. */
export const LOCALES: Locale[] = config.docsLocales ?? [];
export const DEFAULT_LOCALE: string = config.defaultLocale ?? config.lang;

/** The four fields every href builder takes, in one place. */
export function docsUrls(locale?: string): DocsUrlOptions {
  return {
    docsBase: config.docsBase,
    deploymentBase: import.meta.env.BASE_URL,
    locale,
    defaultLocale: DEFAULT_LOCALE,
  };
}

/** What a generated slug carries, empty for the locale that owns the root. */
export function localePrefix(locale?: string): string {
  return locale && locale !== DEFAULT_LOCALE ? `${locale}/` : "";
}

/** What to iterate when building: every locale, or one unlocalised pass. */
export function buildLocales(): (string | undefined)[] {
  return routedLocales({ docsLocales: LOCALES });
}

/** The locale codes whose urls carry a prefix. */
export function prefixedCodes(): string[] {
  return prefixedLocales({
    docsLocales: LOCALES,
    defaultLocale: DEFAULT_LOCALE,
  });
}
