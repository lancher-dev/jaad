/** Every string JAAD puts on a page itself. Override them per locale with the
 *  `ui` option; anything left out falls back to the English here. */
export const UI_DEFAULTS = {
  "breadcrumb.label": "Breadcrumb",
  "breadcrumb.root": "Docs",
  home: "Home",
  "locale.change": "Change language",
  "nav.documentation": "Documentation navigation",
  "nav.jumpToSection": "Jump to section...",
  "nav.mobile": "Toggle mobile menu",
  "nav.page": "Page navigation",
  "nav.selectPage": "Select page",
  "page.copied": "Copied!",
  "page.copy": "Copy page",
  "page.edit": "Edit this page",
  scrollTop: "Scroll to top",
  "search.close": "close",
  "search.empty": "No results for",
  "search.label": "Search documentation",
  "search.loading": "Loading...",
  "search.navigate": "navigate",
  "search.open": "open",
  "search.placeholder": "Search documentation...",
  "search.results": "Search results",
  "search.trigger": "Search docs...",
  "theme.toggle": "Toggle color theme",
  "toc.label": "Table of contents",
} as const;

export type UiKey = keyof typeof UI_DEFAULTS;

export type UiOverrides = Record<string, Partial<Record<string, string>>>;

/** Reads the override for `locale`, then the English default. */
export function uiString(
  overrides: UiOverrides,
  locale: string,
  key: UiKey,
): string {
  // Indexed access is typed as always present; an absent locale is undefined.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return overrides[locale]?.[key] ?? UI_DEFAULTS[key];
}

export const UI_KEYS = Object.keys(UI_DEFAULTS) as UiKey[];
