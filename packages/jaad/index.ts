import type { AstroIntegration } from "astro";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import jaamd from "@lancher-dev/jaamd";

import {
  resolveConfig,
  resolveStylesheets,
  type JaadUserConfig,
} from "./src/config.ts";
import {
  createCoreIntegration,
  createIntegrationState,
  createSitemapFilter,
} from "./src/integration.ts";

/** Astro flattens nested arrays in `integrations`, so this returns the whole set. */
export default function jaad(options: JaadUserConfig): AstroIntegration[] {
  const config = resolveConfig(options);
  const css = resolveStylesheets(config);
  const state = createIntegrationState(options.base);
  const core = createCoreIntegration(config, css, state, Boolean(options.site));

  // Without `site` the sitemap integration can only warn and skip.
  return [
    jaamd({ theme: config.shiki }),
    ...(options.site
      ? [
          sitemap({
            filter: createSitemapFilter(
              config.docsBase,
              state,
              config.defaultLocale,
            ),
          }),
        ]
      : []),
    core,
  ];
}

/** The whole Astro config for a JAAD site. `astro` is merged in, with its
 *  integrations appended rather than replacing ours. */
export function defineJaadSite(options: JaadUserConfig) {
  const { site, base, astro } = options;
  const extra = astro ?? {};
  const extraIntegrations = Array.isArray(extra.integrations)
    ? (extra.integrations as AstroIntegration[])
    : [];

  return defineConfig({
    ...(site ? { site } : {}),
    ...(base ? { base } : {}),
    ...extra,
    integrations: [...jaad(options), ...extraIntegrations],
  });
}

export { defineJaadConfig } from "./src/config.ts";
export type {
  JaadUserConfig,
  JaadConfig,
  JaadResolvedConfig,
} from "./src/config.ts";
