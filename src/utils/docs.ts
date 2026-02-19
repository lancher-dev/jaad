import { slug as githubSlug } from "github-slugger";
import { ucfirst } from "./helpers";
import type {
  DocsHeadings,
  DocsNavItem,
  ParsedDocsCollectionId,
} from "../@types/docs";

/** Matches a numeric order prefix, e.g. "01-" or "123-" */
const NUMBERED_PREFIX_RE = /^(\d+)-(.+)$/;

/**
 * Parse a doc collection ID into its components
 * @param id - The doc ID (e.g., "01-introduction" or "01-chapter/02-section")
 * @param isNumbered - Whether the file has numbered prefix (default: true)
 */
export function parseDocCollectionId(
  id: string,
  isNumbered: boolean = true,
): ParsedDocsCollectionId {
  // Default values
  let order = 999;
  let orderChapter: number | undefined;
  let chapter: string | undefined;

  const parts = id.split("/");
  let slug: string = parts[parts.length - 1];

  // Handle nested structure with chapters
  if (parts.length >= 2) {
    const chapterPart = parts[parts.length - 2];

    // Extract chapter name and order if numbered
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

  // If the filename is numbered, extract order and slug
  if (isNumbered) {
    const match = slug.match(NUMBERED_PREFIX_RE);
    if (match) {
      order = parseInt(match[1], 10);
      slug = match[2];
    }
  }

  // Generate a human-readable title from the slug
  const title = slugToTitle(slug);

  return { order, orderChapter, chapter, slug, title };
}

/**
 * Sort doc pages by chapter and order.
 * Primary order key:
 *  - For pages inside a chapter directory → orderChapter (the dir numeric prefix)
 *  - For root-level pages → their own file order
 * Secondary key: file order within the same chapter.
 */
export function sortDocPages<T extends { id: string }>(pages: T[]): T[] {
  return pages.sort((a, b) => {
    const aParsed = parseDocCollectionId(a.id);
    const bParsed = parseDocCollectionId(b.id);

    const aPrimary = aParsed.orderChapter ?? aParsed.order;
    const bPrimary = bParsed.orderChapter ?? bParsed.order;

    if (aPrimary !== bPrimary) return aPrimary - bPrimary;

    // Same primary (same chapter): sort by file order
    return aParsed.order - bParsed.order;
  });
}

/**
 * Convert a raw collection ID into a URL-safe slug by stripping numeric prefixes
 * from every path segment (e.g., "01-chapter/02-section" → "chapter/section").
 * Centralises the repeated `id.split("/").map(p => p.replace(/^\d+-/, "")).join("/")` pattern.
 */
export function getCleanSlug(id: string): string {
  return id
    .split("/")
    .map((part) => part.replace(NUMBERED_PREFIX_RE, "$2"))
    .join("/");
}

/**
 * Convert a hyphen/underscore-separated slug into a human-readable title.
 * Preserves special characters (e.g. "&", "+") between separators and
 * decodes any percent-encoded sequences (e.g. "%26" → "&").
 * @example slugToTitle("images-&-videos") // "Images & Videos"
 * @example slugToTitle("detail_%26_summary") // "Detail & Summary"
 */
export function slugToTitle(slug: string): string {
  return slug
    .split(/[-_]+/)
    .map((word) => ucfirst(decodeURIComponent(word)))
    .join(" ");
}

/**
 * Format a chapter slug into a human-readable title.
 * @param chapter - The chapter slug (e.g., "getting-started")
 * @returns Formatted chapter title (e.g., "Getting Started"), or null if falsy.
 */
export function formatChapterTitle(chapter: string | undefined): string | null {
  if (!chapter) return null;
  return slugToTitle(chapter);
}

/**
 * Generate a URL-safe slug from heading text.
 * Centralised function used by the TOC and heading-ID generation.
 */
export function generateHeadingSlug(text: string): string {
  return githubSlug(text);
}

/**
 * Extract the first H1 heading from raw markdown content and return it as
 * the page title. This is the authoritative title source because Astro's glob
 * loader silently strips special characters (e.g. "&") from filenames,
 * making slug-derived titles lossy.
 * Returns null if no H1 is found (caller should fall back to slugToTitle).
 */
export function extractTitleFromMarkdown(body: string): string | null {
  for (const line of body.split("\n")) {
    const match = line.match(/^#\s+(.+)$/);
    if (match) return match[1].trim();
  }
  return null;
}

/**
 * Extract h2/h3 headings from raw markdown content.
 * Fenced code blocks (``` or ~~~) are skipped so that headings written as
 * examples inside code samples never appear in the table of contents.
 */
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

/**
 * Build the nav-item list consumed by sidebar and mobile-nav components.
 * Extracted here to avoid duplicating the parseDocCollectionId + getCleanSlug
 * pattern across every component that renders navigation.
 *
 * @param sortedPages - Pages already sorted by sortDocPages()
 * @param currentSlug - The clean slug of the currently-viewed page
 */
export function buildDocNavItems<
  T extends { id: string; body?: string; data?: { title?: string } },
>(sortedPages: T[], currentSlug: string): DocsNavItem[] {
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
      href: `/docs/${cleanSlug}`,
      isActive: currentSlug === cleanSlug,
    };
  });
}
