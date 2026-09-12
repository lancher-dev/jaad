import type { APIRoute, GetStaticPaths } from "astro";
import config from "virtual:jaad/config";
import { getSortedDocsPages } from "../collection.ts";
import { getCleanSlug, routedId } from "../utils/docs.ts";
import { routedLocales } from "../urls.ts";

/** Raw markdown at the page's own url plus `.md`, for readers and for LLMs. */
export const getStaticPaths: GetStaticPaths = async () => {
  const paths: {
    params: { slug: string };
    props: { id: string; locale?: string };
  }[] = [];

  for (const locale of routedLocales(config)) {
    const sortedPages = await getSortedDocsPages(locale);
    const prefix =
      locale && locale !== config.defaultLocale ? `${locale}/` : "";

    for (const page of sortedPages) {
      paths.push({
        params: { slug: `${prefix}${getCleanSlug(routedId(page))}` },
        props: { id: page.id, locale },
      });
    }
  }

  return paths;
};

export const GET: APIRoute = async ({ props }) => {
  const { id, locale } = props as { id: string; locale?: string };
  const pages = await getSortedDocsPages(locale);
  const entry = pages.find((page) => page.id === id);
  if (!entry) return new Response("Not found", { status: 404 });

  return new Response(entry.body ?? "", {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
