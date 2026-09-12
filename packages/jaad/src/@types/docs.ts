export interface ParsedDocsCollectionId {
  slug: string;
  orderChapter?: number;
  chapter?: string;
  order: number;
  title: string;
}

export interface DocsNavItem {
  title: string;
  chapter: string | undefined;
  primaryOrder: number;
  href: string;
  isActive: boolean;
}

export interface DocsHeadings {
  depth: 2 | 3;
  slug: string;
  text: string;
}

/** Resolved frontmatter. Mirrors the schema in content.ts. */
export interface DocsPageData {
  title?: string;
  description?: string;
  label?: string;
  order?: number;
  draft: boolean;
  keywords: string[];
  author?: string;
  ogImage?: string | false;
  lastUpdated?: Date;
}

/** The shape jaad requires of the docs collection. Astro generates collection
 *  types in the consumer project, so the package states its own contract. */
export interface DocsEntry {
  id: string;
  /** Set when the docs are localised; the id without its locale directory. */
  localeId?: string;
  /** Set when the docs are localised. */
  locale?: string;
  body?: string;
  data: DocsPageData;
}
