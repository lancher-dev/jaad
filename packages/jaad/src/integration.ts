import type { AstroIntegration } from "astro";
import tailwindcss from "@tailwindcss/vite";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import type { JaadResolvedConfig } from "./config.ts";
import { fonts } from "./fonts.ts";
import { jaadVirtualPlugin } from "./virtual.ts";
import {
  getCleanSlug,
  getDocCollectionId,
  sortDocPages,
  splitDocLocale,
} from "./utils/docs.ts";
import {
  docsPageHref,
  normaliseBasePath,
  prefixedLocales,
  type DocsUrlOptions,
} from "./urls.ts";

interface Stylesheets {
  user: string | null;
  theme: string | null;
  bridge: string;
}

/** One per locale: each has its own first page, and its own redirect. */
export interface OpeningPage {
  locale?: string;
  slug: string;
}

export interface IntegrationState {
  deploymentBase: string;
  openingPages: OpeningPage[];
  docsFrame: string;
}

const INDEX_PAGE_NAMES = [
  "index.astro",
  "index.md",
  "index.mdx",
  "index.html",
  "index.js",
  "index.ts",
];

const NOT_FOUND_PAGE_NAMES = [
  "404.astro",
  "404.md",
  "404.mdx",
  "404.html",
  "404.js",
  "404.ts",
];

const routeEntrypoint = (file: string) =>
  fileURLToPath(new URL(`./routes/${file}`, import.meta.url));

export function shouldInjectNotFound(docsBase: string, srcDir: URL): boolean {
  return (
    docsBase === "" &&
    !NOT_FOUND_PAGE_NAMES.some((name) =>
      existsSync(new URL(`pages/${name}`, srcDir)),
    )
  );
}

/** The two fields that move the opening page. The content collection is not
 *  available this early, so `order` and `draft` are read from the file. */
function readFrontmatter(source: string): { order?: number; draft?: boolean } {
  const block = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
  if (!block) return {};

  const order = /^order:\s*(-?\d+)\s*$/m.exec(block[1]);
  const draft = /^draft:\s*(true|false)\s*$/m.exec(block[1]);
  return {
    order: order ? Number(order[1]) : undefined,
    draft: draft ? draft[1] === "true" : undefined,
  };
}

export function findOpeningPages(
  dir: string,
  locales: string[] = [],
): OpeningPage[] {
  if (!existsSync(dir)) return [];

  const pages: {
    id: string;
    localeId: string;
    locale: string | null;
    data: { order?: number };
  }[] = [];

  const visit = (current: string) => {
    for (const entry of readdirSync(current, { withFileTypes: true }).sort(
      (a, b) => a.name.localeCompare(b.name),
    )) {
      const file = join(current, entry.name);
      if (entry.isDirectory()) visit(file);
      else if (entry.isFile() && entry.name.endsWith(".md")) {
        const front = readFrontmatter(readFileSync(file, "utf8"));
        if (front.draft) continue;

        const id = getDocCollectionId(relative(dir, file));
        const split = splitDocLocale(id, locales);
        pages.push({
          id,
          localeId: split.id,
          locale: split.locale,
          data: { order: front.order },
        });
      }
    }
  };

  visit(dir);

  const groups = locales.length > 0 ? locales : [null];
  return groups.flatMap((locale) => {
    const first = sortDocPages(
      pages.filter((page) => page.locale === locale),
    )[0];
    if (!first) return [];
    return [
      { locale: locale ?? undefined, slug: getCleanSlug(first.localeId) },
    ];
  });
}

export function getInjectedRoutes(
  docsBase: string,
  locales: string[] = [],
): [string, string][] {
  // `[...slug]` already absorbs "it/guide" and "it". Only the two fixed
  // endpoints need a route of their own, and `[locale]` hands them the code.
  const perLocale: [string, string][] =
    locales.length > 0
      ? [
          [
            `${docsBase}/[locale]/search-index.json`,
            "search-index-locale.json.ts",
          ],
          [`${docsBase}/[locale]/llms.txt`, "llms-locale.txt.ts"],
        ]
      : [];

  return [
    [docsBase, "docs-index.astro"],
    [`${docsBase}/search-index.json`, "search-index.json.ts"],
    [`${docsBase}/llms.txt`, "llms.txt.ts"],
    ...perLocale,
    [`${docsBase}/[...slug]`, "docs-slug.astro"],
    [`${docsBase}/[...slug].md`, "docs-slug.md.ts"],
  ];
}

export function createIntegrationState(base = ""): IntegrationState {
  return {
    deploymentBase: normaliseBasePath(base),
    openingPages: [],
    docsFrame: fileURLToPath(
      new URL("./layouts/DefaultDocsFrame.astro", import.meta.url),
    ),
  };
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
              jaadVirtualPlugin(
                config,
                stylesheets.user,
                stylesheets.theme,
                stylesheets.bridge,
                () => state.docsFrame,
              ),
            ],
            // Package .astro sources must reach the Astro compiler.
            ssr: { noExternal: ["@lancher-dev/jaad"] },
          },
          fonts,
        });

        for (const [pattern, entrypoint] of getInjectedRoutes(
          config.docsBase,
          prefixedLocales(config),
        )) {
          injectRoute({
            pattern,
            entrypoint: routeEntrypoint(entrypoint),
            prerender: true,
          });
        }

        const customDocsFrame = new URL(
          "jaad/DocsFrame.astro",
          astroConfig.srcDir,
        );
        if (existsSync(customDocsFrame)) {
          state.docsFrame = fileURLToPath(customDocsFrame);
          addWatchFile(customDocsFrame);
        }

        if (shouldInjectNotFound(config.docsBase, astroConfig.srcDir)) {
          injectRoute({
            pattern: "/404",
            entrypoint: routeEntrypoint("404.astro"),
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
          state.openingPages = findOpeningPages(
            docsDirPath,
            config.docsLocales.map((locale) => locale.code),
          );
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
  state: Pick<IntegrationState, "deploymentBase" | "openingPages">,
  defaultLocale?: string,
): (page: string) => boolean {
  return (page) => {
    if (state.openingPages.length === 0) return true;

    const pathname = withoutTrailingSlash(new URL(page).pathname);
    return !state.openingPages.some((opening) => {
      const urls: DocsUrlOptions = {
        docsBase,
        deploymentBase: state.deploymentBase,
        locale: opening.locale,
        defaultLocale,
      };
      return (
        pathname === withoutTrailingSlash(docsPageHref(opening.slug, urls))
      );
    });
  };
}
