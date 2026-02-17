export interface ParsedDocsCollectionId {
  slug: string;
  orderChapter?: number;
  chapter?: string;
  order: number;
  title: string;
}

export interface DocsNavItem {
  slug: string;
  title: string;
  url: string;
  active: boolean;
  chapter?: string;
  orderChapter?: number;
}

export interface DocsHeadings {
  depth: number;
  slug: string;
  text: string;
}
