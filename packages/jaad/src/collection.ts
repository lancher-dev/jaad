import { getCollection } from "astro:content";
import type { DocsEntry } from "./@types/docs.ts";

export async function getDocsPages(): Promise<DocsEntry[]> {
  return (await getCollection("docsPages")) as unknown as DocsEntry[];
}
