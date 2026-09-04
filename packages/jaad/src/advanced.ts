import type { DocsHeadings } from "./@types/docs.ts";
import type { DocsNavigation } from "./navigation.ts";

/** Data available to an advanced documentation frame. */
export interface DocsFrameProps {
  page: {
    /** Content collection id, without the Markdown extension. */
    id: string;
    /** File-derived slug. The opening page keeps its named slug here. */
    slug: string;
    title: string;
    chapter?: string;
  };
  headings: DocsHeadings[];
  navigation: DocsNavigation;
}

export type { DocsHeadings, DocsNavItem, DocsEntry } from "./@types/docs.ts";
export type { DocsNavigation, NavSection } from "./navigation.ts";
