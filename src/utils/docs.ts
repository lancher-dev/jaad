import { slug as githubSlug } from "github-slugger";
import { ucfirst } from "./helpers";
import type { DocsHeadings, ParsedDocsCollectionId } from "../@types/docs";

/**
 * Parse a doc collection ID into its components
 * @param id - The doc ID (e.g., "01-introduction" or "01-chapter/02-section")
 * @param isNumbered - Whether the file has numbered prefix (default: false)
 */
export function parseDocCollectionId(
  id: string,
  isNumbered: boolean = false,
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
      const chapterMatch = chapterPart.match(/^(\d+)-(.+)$/);
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
    const match = slug.match(/^(\d+)-(.+)$/);
    if (match) {
      order = parseInt(match[1], 10);
      slug = match[2];
    }
  }

  // Generate a human-readable title from the slug
  let title = slug
    .split("-")
    .map((word) => ucfirst(word))
    .join(" ");

  return { order, orderChapter, chapter, slug, title };
}

/**
 * Sort doc pages by chapter and order
 * @param pages - Array of doc pages to sort
 * @returns Sorted array of doc pages
 */
export function sortDocPages<T extends { id: string }>(pages: T[]): T[] {
  return pages.sort((a, b) => {
    const aParsed = parseDocCollectionId(a.id, true);
    const bParsed = parseDocCollectionId(b.id, true);

    // First sort by chapter
    if (
      aParsed.orderChapter !== undefined &&
      bParsed.orderChapter !== undefined
    ) {
      if (aParsed.orderChapter !== bParsed.orderChapter) {
        return aParsed.orderChapter - bParsed.orderChapter;
      }
    }

    // Then sort by page
    return aParsed.order - bParsed.order;
  });
}

/**
 * Format a chapter slug into a human-readable title
 * @param chapter - The chapter slug (e.g., "getting-started")
 * @returns Formatted chapter title (e.g., "Getting Started")
 */
export function formatChapterTitle(chapter: string | undefined): string | null {
  if (!chapter) return null;

  return chapter
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Generate a URL-safe slug from heading text
 * Centralized function used by TOC and heading ID generation
 * @param text - The heading text
 * @returns URL-safe slug
 */
export function generateHeadingSlug(text: string): string {
  return githubSlug(text);
}

/**
 * Extract headings from markdown content
 * @param markdown - The markdown content
 * @returns Array of headings with depth, text, and slug
 */
export function extractHeadingsFromMarkdown(markdown: string): DocsHeadings[] {
  const headings: DocsHeadings[] = [];
  const lines = markdown.split("\n");

  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+)$/);
    const h3Match = line.match(/^###\s+(.+)$/);

    if (h2Match) {
      const text = h2Match[1].trim();
      headings.push({ depth: 2, text, slug: generateHeadingSlug(text) });
    } else if (h3Match) {
      const text = h3Match[1].trim();
      headings.push({ depth: 3, text, slug: generateHeadingSlug(text) });
    }
  }

  return headings;
}
