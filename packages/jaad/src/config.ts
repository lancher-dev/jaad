import { z } from "astro/zod";
import type {
  AstroUserConfig,
  FontProvider,
  Locales,
  SessionDriverConfig,
} from "astro";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  inferRepo,
  inferDescription,
  editBaseFrom,
  type RepoInfo,
} from "./infer.ts";
import { PRESETS, PRESET_NAMES, isPreset } from "./themes/index.ts";
import {
  describeLocale,
  detectLocales,
  isLocale,
  validateLocaleTree,
  type Locale,
} from "./locales.ts";
import { normaliseBasePath } from "./urls.ts";

export const jaadConfigSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  lang: z.string().default("en"),
  logo: z
    .string()
    .refine((v) => v.startsWith("/") || /^https?:\/\//.test(v), {
      message: 'logo must be a public url, such as "/logo.svg"',
    })
    .optional(),

  docsDir: z.string().default("./docs"),
  routeBase: z.string().default("/"),

  social: z
    .record(
      z.string(),
      z.union([
        z.string(),
        z.object({
          href: z.string(),
          label: z.string().optional(),
          svg: z.string().optional(),
        }),
      ]),
    )
    .default({}),
  nav: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
  footer: z
    .union([z.string(), z.literal(false)], {
      error:
        "footer is one line of text, or false to remove it. " +
        "The message/copyright pair is gone: write them as a single string, " +
        'e.g. "MIT Licensed · © 2026 Me · :credit".',
    })
    .optional(),

  editLink: z.union([z.boolean(), z.string()]).default(true),

  head: z
    .array(
      z.object({
        tag: z.string(),
        attrs: z
          .record(z.string(), z.union([z.string(), z.boolean()]))
          .optional(),
        content: z.string().optional(),
      }),
    )
    .default([]),
  ogImage: z
    .union([
      z.string().refine((v) => v.startsWith("/") || /^https?:\/\//.test(v), {
        message: 'ogImage must be a public url, such as "/og-image.png"',
      }),
      z.literal(false),
    ])
    .optional(),

  theme: z
    .union([
      z.string().refine(isPreset, {
        message: `unknown theme; available: ${PRESET_NAMES.join(", ")}`,
      }),
      z.object({ light: z.string(), dark: z.string() }),
    ])
    .default("default"),

  appearance: z
    .enum(["auto", "light", "dark"], {
      error: "unknown appearance; available: auto, light, dark",
    })
    .default("auto"),

  /** Only when detection guesses wrong: pin the set, or false to switch it off. */
  locales: z
    .union([
      z.array(z.string().refine(isLocale, { message: "not a locale code" })),
      z.literal(false),
    ])
    .optional(),
});

export type JaadConfig = z.output<typeof jaadConfigSchema>;

/** Out of the schema on purpose, so `parse` strips them: the resolved config
 *  is serialised, and an Astro integration is not serialisable. */
type AstroPassthroughConfig = AstroUserConfig<
  Locales,
  string | SessionDriverConfig | undefined,
  FontProvider[]
>;

export type JaadUserConfig = z.input<typeof jaadConfigSchema> & {
  site?: string;
  base?: string;
  astro?: AstroPassthroughConfig;
};

/** What the components actually read: the user's options plus whatever the
 *  repository could tell us. Inferred fields are null when unavailable. */
export interface JaadResolvedConfig extends JaadConfig {
  /** Where the docs are mounted, without a trailing slash. Empty at the root. */
  docsBase: string;
  /** What jaamd gets for code blocks. */
  shiki: string | { light: string; dark: string };
  repoUrl: string | null;
  editBase: string | null;
  favicon: string | null;
  /** Explicit, inferred from public/, or false when no valid image exists. */
  ogImage: string | false;
  /** Empty when the docs are not localised. */
  docsLocales: Locale[];
  /** `lang` when the docs are not localised. */
  defaultLocale: string;
}

const FAVICONS = ["favicon.svg", "favicon.ico", "favicon.png"];
const OG_IMAGES = [
  "og-image.png",
  "og-image.jpg",
  "og-image.jpeg",
  "og-image.webp",
];

function findPublicAsset(cwd: string, candidates: string[]): string | null {
  for (const name of candidates) {
    if (existsSync(join(cwd, "public", name))) return `/${name}`;
  }
  return null;
}

/** Empty at the root, otherwise one leading slash and no trailing one. */
function resolveEditBase(
  editLink: JaadConfig["editLink"],
  repo: RepoInfo | null,
  docsDir: string,
): string | null {
  if (typeof editLink === "string") return editLink;
  if (editLink === false || !repo) return null;
  return editBaseFrom(repo, docsDir);
}

const OPTIONS = Object.keys(jaadConfigSchema.shape);
const FORWARDED = ["site", "base", "astro"];

/** Zod strips what it does not know, so a misspelt option would do nothing at
 *  all. Both messages are read in a terminal, not parsed. */
function parseConfig(options: JaadUserConfig): JaadConfig {
  const known = new Set([...OPTIONS, ...FORWARDED]);
  const unknown = Object.keys(options).filter((key) => !known.has(key));

  if (unknown.length > 0) {
    const named = unknown.map((key) => {
      const close = OPTIONS.find((o) => o.toLowerCase() === key.toLowerCase());
      return close ? `${key} (did you mean ${close}?)` : key;
    });
    throw new Error(
      `jaad: unknown option${unknown.length > 1 ? "s" : ""} ${named.join(", ")}\n` +
        `  available: ${OPTIONS.join(", ")}`,
    );
  }

  const parsed = jaadConfigSchema.safeParse(options);
  if (parsed.success) return parsed.data;

  throw new Error(
    "jaad: invalid configuration\n" +
      parsed.error.issues
        .map(
          (issue) => `  ${issue.path.join(".") || "config"}: ${issue.message}`,
        )
        .join("\n"),
  );
}

export function resolveConfig(
  options: JaadUserConfig,
  cwd: string = process.cwd(),
): JaadResolvedConfig {
  const config = parseConfig(options);
  const repo = inferRepo(cwd);
  const locales = resolveLocales(config, cwd);

  return {
    ...config,
    description: config.description ?? inferDescription(cwd) ?? undefined,
    repoUrl: repo?.url ?? null,
    favicon: findPublicAsset(cwd, FAVICONS),
    ogImage: config.ogImage ?? findPublicAsset(cwd, OG_IMAGES) ?? false,
    docsBase: normaliseBasePath(config.routeBase),
    shiki:
      typeof config.theme === "string"
        ? PRESETS[config.theme].shiki
        : config.theme,
    editBase: resolveEditBase(config.editLink, repo, config.docsDir),
    docsLocales: locales.map(describeLocale),
    defaultLocale: locales.length > 0 ? config.lang.toLowerCase() : config.lang,
  };
}

/** Directory names win; `locales` only overrides what detection found. */
function resolveLocales(config: JaadConfig, cwd: string): string[] {
  if (config.locales === false) return [];

  const docsDir = join(cwd, config.docsDir);
  const locales = config.locales ?? detectLocales(docsDir, config.lang);
  // A pinned list skips detection, and with it the missing-directory guard;
  // the integration warns about that case with better words than readdir does.
  if (locales.length === 0 || !existsSync(docsDir)) return [];

  validateLocaleTree(docsDir, locales, config.lang);
  return locales.map((locale) => locale.toLowerCase()).sort();
}

const requireFrom = createRequire(import.meta.url);

const styleInPackage = (name: string) =>
  fileURLToPath(new URL(`./styles/${name}`, import.meta.url));

/** Absolute paths, kept off the resolved config, which gets serialised. */
export function resolveStylesheets(
  config: JaadConfig,
  cwd: string = process.cwd(),
): { user: string | null; theme: string | null; bridge: string } {
  const userCss = join(cwd, "src", "jaad.css");
  const slug =
    typeof config.theme === "string" ? PRESETS[config.theme].theme : null;

  return {
    user: existsSync(userCss) ? userCss : null,
    // Resolved through JAAMD's export map rather than by path.
    theme: slug
      ? requireFrom.resolve(`@lancher-dev/jaamd/themes/${slug}.css`)
      : null,
    // A preset supplies the palette, so the colours travel the other way.
    bridge: styleInPackage(slug ? "jaamd-reverse.css" : "jaamd-forward.css"),
  };
}

/** Identity helper, so a project can keep its options in its own typed file. */
export function defineJaadConfig(config: JaadUserConfig): JaadUserConfig {
  return config;
}
