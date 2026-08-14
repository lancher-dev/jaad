import type { JaadResolvedConfig } from "./config.ts";
import { FORGES, forgeForUrl } from "./forges.ts";

export interface SocialLink {
  href: string;
  label: string;
  /** Bundled forge icon. */
  path?: string;
  /** User-supplied markup, which wins over the bundled icon. */
  svg?: string;
}

/** The configured links, plus the inferred repository unless already listed. */
export function buildSocialLinks(config: JaadResolvedConfig): SocialLink[] {
  const links: SocialLink[] = [];

  for (const [key, value] of Object.entries(config.social)) {
    const entry = typeof value === "string" ? { href: value } : value;
    const forge = FORGES[key];
    links.push({
      href: entry.href,
      label:
        ("label" in entry ? entry.label : undefined) ?? forge?.label ?? key,
      path: forge?.path,
      svg: "svg" in entry ? entry.svg : undefined,
    });
  }

  if (config.repoUrl && !links.some((l) => l.href === config.repoUrl)) {
    const forge = forgeForUrl(config.repoUrl);
    links.push({
      href: config.repoUrl,
      label: forge ? FORGES[forge].label : "Repository",
      path: forge ? FORGES[forge].path : undefined,
    });
  }

  return links;
}
