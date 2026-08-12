import type { APIRoute } from "astro";
import { getSortedDocsPages } from "../collection.ts";
import { buildSearchIndex } from "../utils/docs.ts";

/**
 * Static search index, emitted once at build time.
 */
export const GET: APIRoute = async () => {
  const sortedPages = await getSortedDocsPages();
  const index = buildSearchIndex(sortedPages);

  return new Response(JSON.stringify(index), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
