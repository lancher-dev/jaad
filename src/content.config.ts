import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const docsPages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./docs" }),
  // All fields are optional: pure markdown files without frontmatter work fine.
  schema: z.object({
    title: z.string().optional(),
    /** Overrides the auto-extracted excerpt used for <meta description> and social cards. */
    description: z.string().optional(),
  }),
});

export const collections = {
  docsPages,
};
