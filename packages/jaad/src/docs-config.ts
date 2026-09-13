import config from "virtual:jaad/config";
import type { Locale } from "./locales.ts";
import type { DocsUrlOptions } from "./urls.ts";
import * as locales from "./locales.ts";

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

export const localePrefix = (locale?: string) =>
  locales.localePrefix(locale, DEFAULT_LOCALE);

export const buildLocales = () => locales.routedLocales(LOCALES);

export const prefixedCodes = () =>
  locales.prefixedLocales(LOCALES, DEFAULT_LOCALE);
