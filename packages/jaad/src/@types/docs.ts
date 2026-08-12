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

/** The shape jaad requires of the docs collection. Astro generates collection
 *  types in the consumer project, so the package states its own contract. */
export interface DocsEntry {
  id: string;
  body?: string;
  data: { title?: string; description?: string };
}
