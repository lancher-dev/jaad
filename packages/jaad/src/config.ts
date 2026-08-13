import { z } from "astro/zod";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  inferRepo,
  inferDescription,
  editBaseFrom,
  type RepoInfo,
} from "./infer.ts";
import { PRESETS, PRESET_NAMES, isPreset } from "./themes/index.ts";

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
  routeBase: z.string().default("/docs"),

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
    .union([
      z.string(),
      z.object({
        message: z.string().optional(),
        copyright: z.string().optional(),
      }),
      z.literal(false),
    ])
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
  ogImage: z.union([z.string(), z.literal(false)]).default("/og-image.png"),

  theme: z
    .union([
      z.string().refine(isPreset, {
        message: `unknown theme; available: ${PRESET_NAMES.join(", ")}`,
      }),
      z.object({ light: z.string(), dark: z.string() }),
    ])
    .default("default"),
});

export type JaadConfig = z.output<typeof jaadConfigSchema>;

/** Out of the schema on purpose, so `parse` strips them: the resolved config
 *  is serialised, and an Astro integration is not serialisable. */
export type JaadUserConfig = z.input<typeof jaadConfigSchema> & {
  site?: string;
  base?: string;
  astro?: Record<string, unknown>;
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
}

const FAVICONS = ["favicon.svg", "favicon.ico", "favicon.png"];

function findFavicon(cwd: string): string | null {
  for (const name of FAVICONS) {
    if (existsSync(join(cwd, "public", name))) return `/${name}`;
  }
  return null;
}

/** Empty at the root, otherwise one leading slash and no trailing one. */
function mountPoint(routeBase: string): string {
  const trimmed = routeBase.replace(/^\/+/, "").replace(/\/+$/, "");
  return trimmed ? `/${trimmed}` : "";
}

function resolveEditBase(
  editLink: JaadConfig["editLink"],
  repo: RepoInfo | null,
  docsDir: string,
): string | null {
  if (typeof editLink === "string") return editLink;
  if (editLink === false || !repo) return null;
  return editBaseFrom(repo, docsDir);
}

export function resolveConfig(
  options: JaadUserConfig,
  cwd: string = process.cwd(),
): JaadResolvedConfig {
  const config = jaadConfigSchema.parse(options);
  const repo = inferRepo(cwd);

  return {
    ...config,
    description: config.description ?? inferDescription(cwd) ?? undefined,
    repoUrl: repo?.url ?? null,
    favicon: findFavicon(cwd),
    docsBase: mountPoint(config.routeBase),
    shiki:
      typeof config.theme === "string"
        ? PRESETS[config.theme].shiki
        : config.theme,
    editBase: resolveEditBase(config.editLink, repo, config.docsDir),
  };
}

/** Absolute paths, kept off the resolved config, which gets serialised. */
export function resolveStylesheets(
  config: JaadConfig,
  cwd: string = process.cwd(),
): { user: string | null; theme: string | null } {
  const userCss = join(cwd, "src", "jaad.css");
  const preset =
    typeof config.theme === "string" ? PRESETS[config.theme].css : null;

  return {
    user: existsSync(userCss) ? userCss : null,
    theme: preset
      ? new URL(`./themes/${preset}`, import.meta.url).pathname
      : null,
  };
}

/** Identity helper, so a project can keep its options in its own typed file. */
export function defineJaadConfig(config: JaadUserConfig): JaadUserConfig {
  return config;
}
