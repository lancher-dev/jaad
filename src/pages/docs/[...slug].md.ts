import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection, getEntry } from "astro:content";
import { sortDocPages, getCleanSlug } from "@/utils/docs";

/**
 * Raw markdown source for every docs page, served alongside the HTML route at
 * the same slug with a `.md` extension (e.g. /docs/markdown/tables.md).
 * Lets readers — and tools that consume markdown directly, such as LLMs —
 * fetch the source without stripping it back out of rendered HTML.
 */
export const getStaticPaths: GetStaticPaths = async () => {
  const docsCollection = await getCollection("docsPages");
  const sortedPages = sortDocPages(docsCollection);

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
