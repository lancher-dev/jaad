import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const docsPages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./docs" }),
  // All fields are optional: pure markdown files without frontmatter work fine.
  // `title` lets you set an explicit navigation/page title when the filename
  // or first H1 would not render correctly (e.g. special characters).
  schema: z.object({
    title: z.string().optional(),
  }),
});

export const collections = {
  docsPages,
};
