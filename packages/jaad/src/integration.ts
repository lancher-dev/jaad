import type { AstroIntegration } from "astro";
import tailwindcss from "@tailwindcss/vite";
import { existsSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import type { JaadResolvedConfig } from "./config.ts";
import { fonts } from "./fonts.ts";
import { jaadVirtualPlugin } from "./virtual.ts";
import {
  getCleanSlug,
  getDocCollectionId,
  sortDocPages,
} from "./utils/docs.ts";
import {
  docsPageHref,
  normaliseBasePath,
  type DocsUrlOptions,
} from "./urls.ts";

interface Stylesheets {
  user: string | null;
  theme: string | null;
}

export interface IntegrationState {
  deploymentBase: string;
  openingSlug: string | null;
}

const INDEX_PAGE_NAMES = [
  "index.astro",
  "index.md",
  "index.mdx",
  "index.html",
  "index.js",
  "index.ts",
];

const routeEntrypoint = (file: string) =>
  new URL(`./routes/${file}`, import.meta.url).pathname;

export function findOpeningDocSlug(dir: string): string | null {
  if (!existsSync(dir)) return null;

  const pages: { id: string }[] = [];
  const visit = (current: string) => {
    for (const entry of readdirSync(current, { withFileTypes: true }).sort(
      (a, b) => a.name.localeCompare(b.name),
    )) {
      const file = join(current, entry.name);
      if (entry.isDirectory()) visit(file);
      else if (entry.isFile() && entry.name.endsWith(".md")) {
        pages.push({ id: getDocCollectionId(relative(dir, file)) });
      }
    }
  };

  visit(dir);
  const first = sortDocPages(pages)[0];
  return first ? getCleanSlug(first.id) : null;
}

function injectedRoutes(docsBase: string): [string, string][] {
  return [
    [docsBase, "docs-index.astro"],
    [`${docsBase}/[...slug]`, "docs-slug.astro"],
    [`${docsBase}/[...slug].md`, "docs-slug.md.ts"],
    ["/search-index.json", "search-index.json.ts"],
    ["/llms.txt", "llms.txt.ts"],
    ["/404", "404.astro"],
  ];
}

export function createIntegrationState(base = ""): IntegrationState {
  return { deploymentBase: normaliseBasePath(base), openingSlug: null };
}

export function createCoreIntegration(
  config: JaadResolvedConfig,
  stylesheets: Stylesheets,
  state: IntegrationState,
  discoverOpeningPage: boolean,
): AstroIntegration {
  return {
    name: "jaad",
    hooks: {
      "astro:config:setup": ({
        config: astroConfig,
        updateConfig,
        injectRoute,
        addWatchFile,
        logger,
      }) => {
        updateConfig({
          vite: {
            plugins: [
              tailwindcss(),
              jaadVirtualPlugin(config, stylesheets.user, stylesheets.theme),
            ],
            // Package .astro sources must reach the Astro compiler.
            ssr: { noExternal: ["@lancher-dev/jaad"] },
          },
          fonts,
        });

        for (const [pattern, entrypoint] of injectedRoutes(config.docsBase)) {
          injectRoute({
            pattern,
            entrypoint: routeEntrypoint(entrypoint),
            prerender: true,
          });
        }

        const docsDirPath = resolve(
          fileURLToPath(astroConfig.root),
          config.docsDir,
        );
        const docsDir = pathToFileURL(docsDirPath);
        if (!existsSync(docsDir)) {
          logger.warn(
            `${config.docsDir} does not exist, so the site has no pages. ` +
              "Create it, or point docsDir at your markdown.",
          );
        } else if (discoverOpeningPage) {
          state.openingSlug = findOpeningDocSlug(docsDirPath);
        }
        addWatchFile(docsDir);

        if (config.docsBase === "") {
          const ownIndex = INDEX_PAGE_NAMES.find((name) =>
            existsSync(new URL(`pages/${name}`, astroConfig.srcDir)),
          );
          if (ownIndex) {
            logger.warn(
              `${ownIndex} owns the site root while JAAD docs are mounted there. ` +
                'Set routeBase: "/docs" to keep a landing page and mount the docs below it.',
            );
          }
        }
      },

      "astro:config:done": ({ config: astroConfig, injectTypes }) => {
        state.deploymentBase = normaliseBasePath(astroConfig.base);
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
}

const withoutTrailingSlash = (value: string) =>
  value.length > 1 ? value.replace(/\/$/, "") : value;

export function createSitemapFilter(
  docsBase: string,
  state: IntegrationState,
): (page: string) => boolean {
  return (page) => {
    if (!state.openingSlug) return true;
    const urls: DocsUrlOptions = {
      docsBase,
      deploymentBase: state.deploymentBase,
    };
    const redirectPath = docsPageHref(state.openingSlug, urls);
    return (
      withoutTrailingSlash(new URL(page).pathname) !==
      withoutTrailingSlash(redirectPath)
    );
  };
}
