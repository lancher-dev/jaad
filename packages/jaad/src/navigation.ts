import type { DocsNavItem } from "./@types/docs.ts";
import {
  docLabel,
  docOrder,
  getCanonicalDocSlug,
  parseDocCollectionId,
  type DocsPageLike,
} from "./utils/docs.ts";
import { docsPageHref, type DocsUrlOptions } from "./urls.ts";

export type NavSection =
  | { type: "page"; order: number; item: DocsNavItem }
  | { type: "chapter"; order: number; chapter: string; items: DocsNavItem[] };

export interface DocsNavigation {
  sections: NavSection[];
  previousPage: DocsNavItem | null;
  nextPage: DocsNavItem | null;
}

function groupByChapter(items: DocsNavItem[]): NavSection[] {
  const chapters = new Map<string, Extract<NavSection, { type: "chapter" }>>();
  const sections: NavSection[] = [];

  for (const item of items) {
    if (!item.chapter) {
      sections.push({ type: "page", order: item.primaryOrder, item });
      continue;
    }

    let chapter = chapters.get(item.chapter);
    if (!chapter) {
      chapter = {
        type: "chapter",
        order: item.primaryOrder,
        chapter: item.chapter,
        items: [],
      };
      chapters.set(item.chapter, chapter);
      sections.push(chapter);
    }
    chapter.items.push(item);
  }

  return sections.sort((a, b) => a.order - b.order);
}

/** Build every navigation view from one ordered collection traversal. */
export function buildDocsNavigation<T extends DocsPageLike>(
  sortedPages: T[],
  currentId: string,
  urls: DocsUrlOptions,
): DocsNavigation {
  const items = sortedPages.map((page, index): DocsNavItem => {
    const parsed = parseDocCollectionId(page.id);
    return {
      title: docLabel(page),
      chapter: parsed.chapter,
      primaryOrder: docOrder(page).primary,
      href: docsPageHref(getCanonicalDocSlug(page, index), urls),
      isActive: page.id === currentId,
    };
  });

  const currentIndex = sortedPages.findIndex((page) => page.id === currentId);

  return {
    sections: groupByChapter(items),
    previousPage: currentIndex > 0 ? items[currentIndex - 1] : null,
    nextPage:
      currentIndex >= 0 && currentIndex < items.length - 1
        ? items[currentIndex + 1]
        : null,
  };
}
