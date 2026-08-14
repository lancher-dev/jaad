import type { AstroIntegration } from "astro";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import jaamd from "jaamd";

import { existsSync } from "node:fs";

import {
  resolveConfig,
  resolveStylesheets,
  type JaadUserConfig,
} from "./src/config.ts";
import { jaadVirtualPlugin } from "./src/virtual.ts";
import { fonts } from "./src/fonts.ts";

const route = (file: string) =>
  new URL(`./src/routes/${file}`, import.meta.url).pathname;

/** Astro flattens nested arrays in `integrations`, so this returns the whole set. */
export default function jaad(options: JaadUserConfig): AstroIntegration[] {
  const config = resolveConfig(options);
  const css = resolveStylesheets(config);
  const docsBase = config.docsBase;

  const routes: [pattern: string, entrypoint: string][] = [
    [docsBase, "docs-index.astro"],
    [`${docsBase}/[...slug]`, "docs-slug.astro"],
    [`${docsBase}/[...slug].md`, "docs-slug.md.ts"],
    ["/search-index.json", "search-index.json.ts"],
    ["/llms.txt", "llms.txt.ts"],
    ["/404", "404.astro"],
  ];

  const core: AstroIntegration = {
    name: "jaad",
    hooks: {
      "astro:config:setup": ({
        updateConfig,
        injectRoute,
        addWatchFile,
        logger,
      }) => {
        updateConfig({
          vite: {
            plugins: [
              tailwindcss(),
              jaadVirtualPlugin(config, css.user, css.theme),
            ],
            // Without this the package's .astro sources are treated as
            // pre-bundled externals and never reach the Astro compiler.
            ssr: { noExternal: ["@lancher-dev/jaad"] },
          },
          fonts,
        });

        for (const [pattern, entrypoint] of routes) {
          injectRoute({
            pattern,
            entrypoint: route(entrypoint),
            prerender: true,
          });
        }

        const docsDir = new URL(config.docsDir, `file://${process.cwd()}/`);
        if (!existsSync(docsDir)) {
          logger.warn(
            `${config.docsDir} does not exist, so the site has no pages. ` +
              "Create it, or point docsDir at your markdown.",
          );
        }
        addWatchFile(docsDir);
      },

      "astro:config:done": ({ injectTypes }) => {
        injectTypes({
          filename: "jaad.d.ts",
          content: `declare module "virtual:jaad/config" {
  const config: import("@lancher-dev/jaad").JaadResolvedConfig;
  export default config;
}`,
        });
      },
    },
  };

  return [jaamd({ theme: config.shiki }), sitemap(), core];
}

/** The whole Astro config for a JAAD site. `astro` is merged in, with its
 *  integrations appended rather than replacing ours. */
export function defineJaadSite(options: JaadUserConfig) {
  const { site, base, astro, ...jaadOptions } = options;
  const extra = (astro ?? {}) as Record<string, unknown>;
  const extraIntegrations = Array.isArray(extra.integrations)
    ? extra.integrations
    : [];

  return defineConfig({
    ...(site ? { site } : {}),
    ...(base ? { base } : {}),
    ...extra,
    integrations: [...jaad(jaadOptions), ...extraIntegrations],
  });
}

export { defineJaadConfig } from "./src/config.ts";
export type {
  JaadUserConfig,
  JaadConfig,
  JaadResolvedConfig,
} from "./src/config.ts";
