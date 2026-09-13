import type { DocsNavItem } from "./@types/docs.ts";
import {
  docLabel,
  getCanonicalDocSlug,
  parseDocCollectionId,
  routedId,
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
interface Model {
  items: DocsNavItem[];
  positions: Map<string, number>;
}

// Only isActive and the neighbours vary between the pages of one locale. The
// hrefs do not, as long as the url options are the same ones.
const models = new WeakMap<object, Map<string, Model>>();

function modelFor<T extends DocsPageLike>(
  sortedPages: T[],
  urls: DocsUrlOptions,
): Model {
  const key = `${urls.docsBase}\u0000${urls.deploymentBase ?? ""}\u0000${urls.locale ?? ""}\u0000${urls.defaultLocale ?? ""}`;
  let byUrls = models.get(sortedPages);
  if (!byUrls) {
    byUrls = new Map();
    models.set(sortedPages, byUrls);
  }
  const cached = byUrls.get(key);
  if (cached) return cached;

  const model: Model = {
    items: sortedPages.map((page, index): DocsNavItem => {
      const parsed = parseDocCollectionId(routedId(page));
      return {
        title: docLabel(page),
        chapter: parsed.chapter,
        primaryOrder: parsed.orderChapter ?? page.data?.order ?? parsed.order,
        href: docsPageHref(getCanonicalDocSlug(page, index), urls),
        isActive: false,
      };
    }),
    positions: new Map(sortedPages.map((page, index) => [page.id, index])),
  };

  byUrls.set(key, model);
  return model;
}

export function buildDocsNavigation<T extends DocsPageLike>(
  sortedPages: T[],
  currentId: string,
  urls: DocsUrlOptions,
): DocsNavigation {
  const { items, positions } = modelFor(sortedPages, urls);
  const currentIndex = positions.get(currentId) ?? -1;
  const marked = items.map((item, index) => ({
    ...item,
    isActive: index === currentIndex,
  }));

  return {
    sections: groupByChapter(marked),
    previousPage: currentIndex > 0 ? marked[currentIndex - 1] : null,
    nextPage:
      currentIndex >= 0 && currentIndex < marked.length - 1
        ? marked[currentIndex + 1]
        : null,
  };
}
