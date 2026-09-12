import config from "virtual:jaad/config";
import { getSortedDocsPages } from "../collection.ts";
import { docsMarkdownHref } from "../urls.ts";
import { docsUrls } from "../docs-config.ts";
import {
  buildSearchIndex,
  extractDescription,
  extractTitleFromMarkdown,
  formatChapterTitle,
  getCleanSlug,
  parseDocCollectionId,
  routedId,
} from "./docs.ts";

export async function searchIndexResponse(locale?: string): Promise<Response> {
  const index = buildSearchIndex(await getSortedDocsPages(locale));

  return new Response(JSON.stringify(index), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

interface Row {
  title: string;
  slug: string;
  description: string | null;
}

/** Plain-text index of every page, per the llms.txt convention. */
export async function llmsResponse(
  site: URL | undefined,
  locale?: string,
): Promise<Response> {
  const sortedPages = await getSortedDocsPages(locale);

  const markdownHref = (slug: string): string => {
    const href = docsMarkdownHref(slug, docsUrls(locale));
    return site ? new URL(href, site.origin).href : href;
  };

  const standalone: Row[] = [];
  const chapterOrder: string[] = [];
  const chapters = new Map<string, Row[]>();

  for (const page of sortedPages) {
    const id = routedId(page);
    const parsed = parseDocCollectionId(id);
    const title =
      page.data.title ??
      extractTitleFromMarkdown(page.body || "") ??
      parsed.title;
    const description =
      page.data.description ?? extractDescription(page.body || "", title);
    const row: Row = { title, slug: getCleanSlug(id), description };

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
}
