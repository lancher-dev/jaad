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
}

/** Public href for a documentation page. Empty means the opening page. */
export function docsPageHref(
  slug: string,
  { docsBase, deploymentBase = "" }: DocsUrlOptions,
): string {
  const mount = normaliseBasePath(docsBase);
  const href = slug ? `${mount}/${slug}` : mount || "/";
  return withDeploymentBase(href, deploymentBase);
}

/** Raw Markdown keeps the page's named slug, including for the opener. */
export function docsMarkdownHref(
  slug: string,
  { docsBase, deploymentBase = "" }: DocsUrlOptions,
): string {
  const href = `${normaliseBasePath(docsBase)}/${slug}.md`;
  return withDeploymentBase(href, deploymentBase);
}
