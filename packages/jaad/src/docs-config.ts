import config from "virtual:jaad/config";
import type { Locale } from "./locales.ts";
import type { DocsUrlOptions } from "./urls.ts";
import * as locales from "./locales.ts";
import { uiString, type UiKey } from "./ui.ts";

/** The virtual config, read once. */
export const LOCALES: Locale[] = config.docsLocales;
export const DEFAULT_LOCALE: string = config.defaultLocale;

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

/** The interface strings for a page, already resolved. */
export function ui(locale: string = DEFAULT_LOCALE) {
  return (key: UiKey) => uiString(config.ui, locale, key);
}
