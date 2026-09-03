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
  }),
});

export const collections = { docsPages };
