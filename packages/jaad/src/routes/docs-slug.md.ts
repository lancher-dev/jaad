import type { APIRoute, GetStaticPaths } from "astro";
import { getEntry } from "astro:content";
import { getSortedDocsPages } from "../collection.ts";
import { getCleanSlug } from "../utils/docs.ts";

/** Raw markdown at the page's own url plus `.md`, for readers and for LLMs. */
export const getStaticPaths: GetStaticPaths = async () => {
  const sortedPages = await getSortedDocsPages();

  return sortedPages.map((page) => ({
    params: { slug: getCleanSlug(page.id) },
    props: { id: page.id },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { id } = props as { id: string };
  const entry = await getEntry("docsPages", id);
  if (!entry) return new Response("Not found", { status: 404 });

  return new Response(entry.body ?? "", {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
