import GithubSlugger, { slug as githubSlug } from "github-slugger";
import { ucfirst } from "./helpers.ts";
import type {
  DocsHeadings,
  DocsPageData,
  ParsedDocsCollectionId,
} from "../@types/docs.ts";

/** The id without its locale directory: what routing and ordering read. */
export function routedId(page: DocsPageLike): string {
  return page.localeId ?? page.id;
}

/** "it/02-guides/01-setup" becomes locale "it" and "02-guides/01-setup". */
export function splitDocLocale(
  id: string,
  locales: string[],
): { locale: string | null; id: string } {
  const slash = id.indexOf("/");
  if (slash === -1) return { locale: null, id };

  const first = id.slice(0, slash);
  if (!locales.includes(first)) return { locale: null, id };
  return { locale: first, id: id.slice(slash + 1) };
}

/** Matches a numeric order prefix, e.g. "01-" or "123-" */
const NUMBERED_PREFIX_RE = /^(\d+)-(.+)$/;

export function parseDocCollectionId(id: string): ParsedDocsCollectionId {
  let order = 999;
  let orderChapter: number | undefined;
  let chapter: string | undefined;

  const parts = id.split("/");
  let slug: string = parts[parts.length - 1];

  if (parts.length >= 2) {
    const chapterPart = parts[parts.length - 2];
    const chapterMatch = NUMBERED_PREFIX_RE.exec(chapterPart);
    if (chapterMatch) {
      orderChapter = parseInt(chapterMatch[1], 10);
      chapter = chapterMatch[2];
    } else {
      chapter = chapterPart;
    }
  }

  const match = NUMBERED_PREFIX_RE.exec(slug);
  if (match) {
    order = parseInt(match[1], 10);
    slug = match[2];
  }

  return { order, orderChapter, chapter, slug, title: slugToTitle(slug) };
}

/** Chapter first, then file order within it. Root pages sort by their own
 *  number, so they interleave with chapters. Returns a new array. */
export function sortDocPages<T extends DocsPageLike>(pages: T[]): T[] {
  return pages
    .map((page) => ({ page, ...docOrder(page) }))
    .sort((a, b) => a.primary - b.primary || a.secondary - b.secondary)
    .map((entry) => entry.page);
}

/** Frontmatter `order` replaces the filename prefix number. A chapter keeps
 *  its own. */
export function docOrder(page: DocsPageLike): {
  primary: number;
  secondary: number;
} {
  const parsed = parseDocCollectionId(routedId(page));
  const order = page.data?.order ?? parsed.order;
  return { primary: parsed.orderChapter ?? order, secondary: order };
}

/** "01-chapter/02-section" → "chapter/section" */
export function getCleanSlug(id: string): string {
  return id
    .split("/")
    .map((part) => part.replace(NUMBERED_PREFIX_RE, "$2"))
    .join("/");
}

/** Match the ids produced by Astro's glob loader, independently of the OS. */
export function getDocCollectionId(filePath: string): string {
  return filePath
    .replace(/\.md$/, "")
    .split(/[\\/]/)
    .map((part) => githubSlug(part))
    .join("/");
}

/** Fail before route generation when the file tree cannot produce one clear
 * navigation and URL for every page. */
export function validateDocsStructure(
  pages: DocsPageLike[],
  locale?: string,
): void {
  const idsBySlug = new Map<string, string[]>();
  const directoriesByChapter = new Map<string, Set<string>>();
  const issues: string[] = [];
  // Messages name the file on disk, locale directory included.
  const named = (id: string) => (locale ? `${locale}/${id}` : id);

  for (const id of pages.map(routedId).sort()) {
    const parts = id.split("/");
    if (parts.length > 2) {
      issues.push(
        `${named(id)}: only one chapter directory is supported inside docs/`,
      );
    }

    const slug = getCleanSlug(id);
    const ids = idsBySlug.get(slug) ?? [];
    ids.push(id);
    idsBySlug.set(slug, ids);

    if (parts.length === 2) {
      const directory = parts[0];
      const chapter = getCleanSlug(directory);
      const directories = directoriesByChapter.get(chapter) ?? new Set();
      directories.add(directory);
      directoriesByChapter.set(chapter, directories);
    }
  }

  for (const [slug, ids] of idsBySlug) {
    if (ids.length > 1) {
      issues.push(`${ids.map(named).join(", ")} all resolve to /${slug}`);
    }
  }

  for (const [chapter, directories] of directoriesByChapter) {
    if (directories.size > 1) {
      issues.push(
        `${[...directories].map(named).join(", ")} all resolve to chapter /${chapter}`,
      );
    }
  }

  if (issues.length > 0) {
    throw new Error(
      `jaad: invalid documentation structure\n${issues.map((issue) => `  ${issue}`).join("\n")}`,
    );
  }
}

/** The opening page owns routeBase; every later page keeps its named slug. */
export function getCanonicalDocSlug(page: DocsPageLike, index: number): string {
  return index === 0 ? "" : getCleanSlug(routedId(page));
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
  // Per page, like the renderer: repeated headings get -1, -2 suffixes.
  const slugger = new GithubSlugger();
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
    headings.push({ depth, text, slug: slugger.slug(text) });
  }

  return headings;
}

export interface DocsPageLike {
  id: string;
  /** Set when the docs are localised; the id without its locale directory. */
  localeId?: string;
  body?: string;
  data?: Partial<DocsPageData>;
}

/** Frontmatter title, then the first H1, then the slug. */
export function docTitle(page: DocsPageLike): string {
  return (
    page.data?.title ??
    (page.body ? extractTitleFromMarkdown(page.body) : null) ??
    parseDocCollectionId(routedId(page)).title
  );
}

/** The name navigation uses. */
export function docLabel(page: DocsPageLike): string {
  return page.data?.label ?? docTitle(page);
}

// ── Search index ────────────────────────────────────────────────────────────

export interface DocsSearchEntry {
  title: string;
  slug: string;
  chapter: string | null;
  keywords: string[];
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
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
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

export function buildSearchIndex(
  sortedPages: DocsPageLike[],
): DocsSearchEntry[] {
  return sortedPages.map((page, index) => ({
    title: docTitle(page),
    slug: getCanonicalDocSlug(page, index),
    chapter: formatChapterTitle(parseDocCollectionId(routedId(page)).chapter),
    keywords: page.data?.keywords ?? [],
    body: stripMarkdown(page.body || ""),
  }));
}
