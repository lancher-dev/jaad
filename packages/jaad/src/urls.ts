import type { JaadResolvedConfig } from "./config.ts";

/** Empty at the site root, otherwise one leading slash and no trailing slash. */
export function normaliseBasePath(value: string): string {
  const trimmed = value.replace(/^\/+/, "").replace(/\/+$/, "");
  return trimmed ? `/${trimmed}` : "";
}

/** Apply Astro's deployment base to an application-local, root-relative href. */
export function withDeploymentBase(
  href: string,
  deploymentBase: string,
): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;

  const prefix = normaliseBasePath(deploymentBase);
  if (!prefix) return href;
  return href === "/" ? `${prefix}/` : `${prefix}${href}`;
}

export interface DocsUrlOptions {
  /** Normalised routeBase: empty at the application root. */
  docsBase: string;
  /** Astro's deployment base. */
  deploymentBase?: string;
  /** Locale of the page, when the docs are localised. */
  locale?: string;
  /** The one locale that owns the unprefixed urls. */
  defaultLocale?: string;
}

/** Empty for the default locale, which keeps the urls it had before i18n. */
function localeSegment(locale?: string, defaultLocale?: string): string {
  return !locale || locale === defaultLocale ? "" : locale;
}

/** Public href for a documentation page. Empty means the opening page. */
export function docsPageHref(
  slug: string,
  { docsBase, deploymentBase = "", locale, defaultLocale }: DocsUrlOptions,
): string {
  const mount = normaliseBasePath(docsBase);
  const path = [localeSegment(locale, defaultLocale), slug]
    .filter(Boolean)
    .join("/");
  const href = path ? `${mount}/${path}` : mount || "/";
  return withDeploymentBase(href, deploymentBase);
}

/** Raw Markdown keeps the page's named slug, including for the opener. */
export function docsMarkdownHref(
  slug: string,
  { docsBase, deploymentBase = "", locale, defaultLocale }: DocsUrlOptions,
): string {
  const path = [localeSegment(locale, defaultLocale), slug]
    .filter(Boolean)
    .join("/");
  const href = `${normaliseBasePath(docsBase)}/${path}.md`;
  return withDeploymentBase(href, deploymentBase);
}

/** What to iterate when building: every locale, or one unlocalised pass. */
export function routedLocales(
  config: Pick<JaadResolvedConfig, "docsLocales">,
): (string | undefined)[] {
  return config.docsLocales.length > 0
    ? config.docsLocales.map((locale) => locale.code)
    : [undefined];
}

/** The locales whose urls carry a prefix: everything but the default one. */
export function prefixedLocales(
  config: Pick<JaadResolvedConfig, "docsLocales" | "defaultLocale">,
): string[] {
  return config.docsLocales
    .map((locale) => locale.code)
    .filter((code) => code !== config.defaultLocale);
}
