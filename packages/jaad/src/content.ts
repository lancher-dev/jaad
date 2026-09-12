import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import config from "virtual:jaad/config";
import { getDocCollectionId } from "./utils/docs.ts";

const docsPages = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: config.docsDir,
    // Keep URLs file-driven even if markdown contains an unrelated slug field.
    generateId: ({ entry }) => getDocCollectionId(entry),
  }),
  // Every field is optional: markdown without frontmatter works as-is.
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    /** Shorter label, in navigation only. */
    label: z.string().optional(),
    /** Replaces the filename prefix number. */
    order: z.number().int().optional(),
    /** Left out of production builds. */
    draft: z.boolean().default(false),
    /** Metadata and search weight; never rendered. */
    keywords: z.array(z.string()).default([]),
    author: z.string().optional(),
    /** Public path or URL; false drops the site's. */
    ogImage: z
      .union([
        z.string().refine((v) => v.startsWith("/") || /^https?:\/\//.test(v), {
          message: 'ogImage must be a public url, such as "/og/page.png"',
        }),
        z.literal(false),
      ])
      .optional(),
    lastUpdated: z.coerce.date().optional(),
  }),
});

export const collections = { docsPages };
