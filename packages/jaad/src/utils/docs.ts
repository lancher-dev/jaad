import { slug as githubSlug } from "github-slugger";
import { ucfirst } from "./helpers.ts";
import type {
  DocsHeadings,
  DocsNavItem,
  ParsedDocsCollectionId,
} from "../@types/docs.ts";

/** Matches a numeric order prefix, e.g. "01-" or "123-" */
const NUMBERED_PREFIX_RE = /^(\d+)-(.+)$/;

export function parseDocCollectionId(
  id: string,
  isNumbered: boolean = true,
): ParsedDocsCollectionId {
  let order = 999;
  let orderChapter: number | undefined;
  let chapter: string | undefined;

  const parts = id.split("/");
  let slug: string = parts[parts.length - 1];

  // Handle nested structure with chapters
  if (parts.length >= 2) {
    const chapterPart = parts[parts.length - 2];

    if (isNumbered) {
      const chapterMatch = chapterPart.match(NUMBERED_PREFIX_RE);
      if (chapterMatch) {
        orderChapter = parseInt(chapterMatch[1], 10);
        chapter = chapterMatch[2];
      } else {
        chapter = chapterPart;
      }
    } else {
      chapter = chapterPart;
    }
  }

  if (isNumbered) {
    const match = slug.match(NUMBERED_PREFIX_RE);
    if (match) {
      order = parseInt(match[1], 10);
      slug = match[2];
    }
  }

  const title = slugToTitle(slug);

  return { order, orderChapter, chapter, slug, title };
}

/** Sorts by chapter, then by file order within it. Root pages sort by their own
 *  number, so they interleave with chapters. Returns a new array. */
export function sortDocPages<T extends { id: string }>(pages: T[]): T[] {
  return pages
    .map((page) => {
      const parsed = parseDocCollectionId(page.id);
      return {
        page,
        primary: parsed.orderChapter ?? parsed.order,
        secondary: parsed.order,
      };
    })
    .sort((a, b) => a.primary - b.primary || a.secondary - b.secondary)
    .map((entry) => entry.page);
}

/** "01-chapter/02-section" → "chapter/section" */
export function getCleanSlug(id: string): string {
  return id
    .split("/")
    .map((part) => part.replace(NUMBERED_PREFIX_RE, "$2"))
    .join("/");
}

/** Decodes percent-escapes, so "detail_%26_summary" → "Detail & Summary". */
export function slugToTitle(slug: string): string {
  return slug
    .split(/[-_]+/)
    .map((word) => ucfirst(decodeURIComponent(word)))
    .join(" ");
}

export function formatChapterTitle(chapter: string | undefined): string | null {
  if (!chapter) return null;
  return slugToTitle(chapter);
}

export function generateHeadingSlug(text: string): string {
  return githubSlug(text);
}

/** The authoritative title: Astro's glob loader strips special characters from
 *  filenames, so a slug-derived title is lossy. */
export function extractTitleFromMarkdown(body: string): string | null {
  for (const line of body.split("\n")) {
    const match = line.match(/^#\s+(.+)$/);
    if (match) return match[1].trim();
  }
  return null;
}

/** Skips fenced blocks, so headings written as code samples stay out of the TOC. */
export function extractHeadingsFromMarkdown(markdown: string): DocsHeadings[] {
  const headings: DocsHeadings[] = [];
  let insideFence = false;

  for (const line of markdown.split("\n")) {
    if (line.match(/^(`{3,}|~{3,})/)) {
      insideFence = !insideFence;
      continue;
    }
    if (insideFence) continue;

    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (!match) continue;
    const depth = match[1].length as 2 | 3;
    const text = match[2].trim();
    headings.push({ depth, text, slug: generateHeadingSlug(text) });
  }

  return headings;
}

/** `base` is the mount point, without a trailing slash. */
export function buildDocNavItems<
  T extends { id: string; body?: string; data?: { title?: string } },
>(sortedPages: T[], currentSlug: string, base = ""): DocsNavItem[] {
  return sortedPages.map((page) => {
    const parsed = parseDocCollectionId(page.id);
    const cleanSlug = getCleanSlug(page.id);
    // Priority: explicit frontmatter title → first H1 in body → slug-derived title
    const title =
      page.data?.title ??
      (page.body ? extractTitleFromMarkdown(page.body) : null) ??
      parsed.title;
    return {
      title,
      chapter: parsed.chapter,
      primaryOrder: parsed.orderChapter ?? parsed.order,
      href: `${base}/${cleanSlug}`,
      isActive: currentSlug === cleanSlug,
    };
  });
}

// ── Search index ────────────────────────────────────────────────────────────

export interface DocsSearchEntry {
  title: string;
  slug: string;
  chapter: string | null;
  body: string;
}

/** Strip markdown (and inline HTML) syntax to plain text for search indexing. */
export function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`{3,}[\s\S]*?`{3,}/g, "")
    .replace(/(?<!`)<[^>]+>(?!`)/g, "")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "")
    .replace(/^>\s?/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/^:::.*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Excerpt for <meta description>, when the page has no explicit one. */
export function extractDescription(
  body: string,
  title: string,
  maxLength: number = 155,
): string | null {
  const stripped = stripMarkdown(body);
  const paragraphs = stripped
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const firstParagraph = paragraphs.find(
    (p) => p.toLowerCase() !== title.trim().toLowerCase(),
  );
  if (!firstParagraph) return null;

  if (firstParagraph.length <= maxLength) return firstParagraph;
  const truncated = firstParagraph.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${truncated.slice(0, lastSpace > 0 ? lastSpace : maxLength)}…`;
}

export function buildSearchIndex<
  T extends { id: string; body?: string; data?: { title?: string } },
>(sortedPages: T[]): DocsSearchEntry[] {
  return sortedPages.map((page) => {
    const parsed = parseDocCollectionId(page.id);
    const cleanSlug = getCleanSlug(page.id);
    const title =
      page.data?.title ??
      (page.body ? extractTitleFromMarkdown(page.body) : null) ??
      parsed.title;
    return {
      title,
      slug: cleanSlug,
      chapter: formatChapterTitle(parsed.chapter),
      body: stripMarkdown(page.body || ""),
    };
  });
}
