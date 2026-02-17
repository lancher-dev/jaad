import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const docsPages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./docs" }),
});

export const collections = {
  docsPages,
};
