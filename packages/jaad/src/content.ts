import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import config from "virtual:jaad/config";

const docsPages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: config.docsDir }),
  // Every field is optional: markdown without frontmatter works as-is.
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const collections = { docsPages };
