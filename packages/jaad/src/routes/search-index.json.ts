import type { APIRoute } from "astro";
import { getDocsPages } from "../collection.ts";
import { buildSearchIndex, sortDocPages } from "../utils/docs.ts";

/**
 * Static search index, emitted once at build time.
 */
export const GET: APIRoute = async () => {
  const docsCollection = await getDocsPages();
  const index = buildSearchIndex(sortDocPages(docsCollection));

  return new Response(JSON.stringify(index), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
