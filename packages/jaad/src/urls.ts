import { localeSegment } from "./locales.ts";

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

/** Public href for a documentation page. Empty slug means the opening page. */
export function docsPageHref(slug: string, urls: DocsUrlOptions): string {
  return docsHref(slug, urls);
}

/** Raw Markdown keeps the page's named slug, including for the opener. */
export function docsMarkdownHref(slug: string, urls: DocsUrlOptions): string {
  return docsHref(slug, urls, ".md");
}

function docsHref(
  slug: string,
  { docsBase, deploymentBase = "", locale, defaultLocale }: DocsUrlOptions,
  suffix = "",
): string {
  const mount = normaliseBasePath(docsBase);
  const path = [localeSegment(locale, defaultLocale), slug]
    .filter(Boolean)
    .join("/");
  // Without a suffix an empty path is the mount itself; with one it is a file.
  const href = path || suffix ? `${mount}/${path}${suffix}` : mount || "/";
  return withDeploymentBase(href, deploymentBase);
}
