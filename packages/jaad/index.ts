import type { AstroIntegration } from "astro";
import { fontProviders } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import jaamd from "jaamd";

import { existsSync } from "node:fs";
import { join } from "node:path";

import { resolveConfig, type JaadUserConfig } from "./src/config.ts";
import { jaadVirtualPlugin } from "./src/virtual.ts";

const route = (file: string) =>
  new URL(`./src/routes/${file}`, import.meta.url).pathname;

/** Astro flattens nested arrays in `integrations`, so this returns the whole set. */
export default function jaad(options: JaadUserConfig): AstroIntegration[] {
  const config = resolveConfig(options);
  const base = config.routeBase.replace(/\/$/, "");

  // Convention: a project-level stylesheet, loaded after the package's own so
  // it can override the tokens.
  const userCssPath = join(process.cwd(), "src", "jaad.css");
  const userCss = existsSync(userCssPath) ? userCssPath : null;

  const core: AstroIntegration = {
    name: "jaad",
    hooks: {
      "astro:config:setup": ({ updateConfig, injectRoute, addWatchFile }) => {
        updateConfig({
          vite: {
            plugins: [tailwindcss(), jaadVirtualPlugin(config, userCss)],
            // Without this the package's .astro sources are treated as
            // pre-bundled externals and never reach the Astro compiler.
            ssr: { noExternal: ["jaad"] },
          },
          fonts: [
            {
              provider: fontProviders.google(),
              name: "Inter",
              cssVariable: "--font-inter",
              weights: [400, 500, 600],
              styles: ["normal"],
            },
            {
              provider: fontProviders.google(),
              name: "Merriweather",
              cssVariable: "--font-merriweather",
              weights: [300, 400, 700],
              styles: ["normal", "italic"],
            },
          ],
        });

        injectRoute({
          pattern: `${base}`,
          entrypoint: route("docs-index.astro"),
          prerender: true,
        });
        injectRoute({
          pattern: `${base}/[...slug]`,
          entrypoint: route("docs-slug.astro"),
          prerender: true,
        });
        injectRoute({
          pattern: `${base}/[...slug].md`,
          entrypoint: route("docs-slug.md.ts"),
          prerender: true,
        });
        injectRoute({
          pattern: "/search-index.json",
          entrypoint: route("search-index.json.ts"),
          prerender: true,
        });
        injectRoute({
          pattern: "/llms.txt",
          entrypoint: route("llms.txt.ts"),
          prerender: true,
        });
        injectRoute({
          pattern: "/404",
          entrypoint: route("404.astro"),
          prerender: true,
        });

        addWatchFile(new URL(config.docsDir, `file://${process.cwd()}/`));
      },

      "astro:config:done": ({ injectTypes }) => {
        injectTypes({
          filename: "jaad.d.ts",
          content: `declare module "virtual:jaad/config" {
  const config: import("jaad").JaadResolvedConfig;
  export default config;
}`,
        });
      },
    },
  };

  return [jaamd({ theme: config.theme }), sitemap(), core];
}

export { defineJaadConfig } from "./src/config.ts";
export type {
  JaadUserConfig,
  JaadConfig,
  JaadResolvedConfig,
} from "./src/config.ts";
