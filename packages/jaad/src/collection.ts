import { getCollection } from "astro:content";
import type { DocsEntry } from "./@types/docs.ts";
import { sortDocPages } from "./utils/docs.ts";

let cached: DocsEntry[] | null = null;

/** Cached in production only: in dev the module would go stale on edit. */
export async function getSortedDocsPages(): Promise<DocsEntry[]> {
  if (import.meta.env.PROD && cached) return cached;
  const pages = (await getCollection("docsPages")) as unknown as DocsEntry[];
  const sorted = sortDocPages(pages);
  if (import.meta.env.PROD) cached = sorted;
  return sorted;
}
