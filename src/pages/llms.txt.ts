import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import {
  sortDocPages,
  parseDocCollectionId,
  getCleanSlug,
  extractTitleFromMarkdown,
  extractDescription,
  formatChapterTitle,
} from "@/utils/docs";

/**
 * llms.txt — a plain-text index of every docs page, linking to its raw
 * markdown source rather than the rendered HTML. Follows the emerging
 * llms.txt convention (https://llmstxt.org) so tools and language models can
 * discover and fetch the site's content without scraping HTML.
 */
export const GET: APIRoute = async ({ site }) => {
  const docsCollection = await getCollection("docsPages");
  const sortedPages = sortDocPages(docsCollection);

  const base = site ? site.href.replace(/\/$/, "") : "";

  interface Row {
    title: string;
    slug: string;
    description: string | null;
  }

  const standalone: Row[] = [];
  const chapterOrder: string[] = [];
  const chapters = new Map<string, Row[]>();

  for (const page of sortedPages) {
    const parsed = parseDocCollectionId(page.id);
    const title =
      page.data.title ??
      extractTitleFromMarkdown(page.body || "") ??
      parsed.title;
    const description =
      page.data.description ?? extractDescription(page.body || "", title);
    const row: Row = { title, slug: getCleanSlug(page.id), description };

    if (!parsed.chapter) {
      standalone.push(row);
      continue;
    }
    if (!chapters.has(parsed.chapter)) {
      chapters.set(parsed.chapter, []);
      chapterOrder.push(parsed.chapter);
    }
    chapters.get(parsed.chapter)!.push(row);
  }

  const toLine = (row: Row): string =>
    `- [${row.title}](${base}/docs/${row.slug}.md)${row.description ? `: ${row.description}` : ""}`;

  const sections: string[] = [];
  if (standalone.length > 0) {
    sections.push(standalone.map(toLine).join("\n"));
  }
  for (const chapter of chapterOrder) {
    const heading = formatChapterTitle(chapter) ?? chapter;
    sections.push(
      `## ${heading}\n\n${chapters.get(chapter)!.map(toLine).join("\n")}`,
    );
  }

  const content = [
    "# JAAD",
    "> Just Another Astro Docs — a clean, minimalist documentation framework for Astro. Each entry links to the raw markdown source of that page.",
    ...sections,
  ].join("\n\n");

  return new Response(content + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
