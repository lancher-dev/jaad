import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { buildSearchIndex, sortDocPages } from "@/utils/docs";

/**
 * Static search index, emitted once at build time.
 */
export const GET: APIRoute = async () => {
  const docsCollection = await getCollection("docsPages");
  const index = buildSearchIndex(sortDocPages(docsCollection));

  return new Response(JSON.stringify(index), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
