import type { APIRoute } from "astro";
import { getSortedDocsPages } from "../collection.ts";
import {
  parseDocCollectionId,
  getCleanSlug,
  extractTitleFromMarkdown,
  extractDescription,
  formatChapterTitle,
} from "../utils/docs.ts";
import config from "virtual:jaad/config";
import { docsMarkdownHref } from "../urls.ts";

/** Plain-text index of every page, per the llms.txt convention. */
export const GET: APIRoute = async ({ site }) => {
  const sortedPages = await getSortedDocsPages();

  interface Row {
    title: string;
    slug: string;
    description: string | null;
  }

  const markdownHref = (slug: string): string => {
    const href = docsMarkdownHref(slug, {
      docsBase: config.docsBase,
      deploymentBase: import.meta.env.BASE_URL,
    });
    return site ? new URL(href, site.origin).href : href;
  };

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
    `- [${row.title}](${markdownHref(row.slug)})${row.description ? `: ${row.description}` : ""}`;

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
    `# ${config.title}`,
    ...(config.description ? [`> ${config.description}`] : []),
    ...sections,
  ].join("\n\n");

  return new Response(content + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
