import { getCollection } from "astro:content";
import type { DocsEntry } from "./@types/docs.ts";
import { sortDocPages } from "./utils/docs.ts";

export async function getDocsPages(): Promise<DocsEntry[]> {
  return (await getCollection("docsPages")) as unknown as DocsEntry[];
}

let cached: DocsEntry[] | null = null;

/** Cached in production only: in dev the module would go stale on edit. */
export async function getSortedDocsPages(): Promise<DocsEntry[]> {
  if (import.meta.env.PROD && cached) return cached;
  const sorted = sortDocPages(await getDocsPages());
  if (import.meta.env.PROD) cached = sorted;
  return sorted;
}
