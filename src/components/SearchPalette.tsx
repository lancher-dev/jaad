import { useState, useEffect, useRef, useCallback } from "react";
import { navigate } from "astro:transitions/client";

interface SearchItem {
  title: string;
  slug: string;
  chapter: string | null;
  body: string;
}

interface Props {
  inDocs?: boolean;
}

const INDEX_URL = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/search-index.json`;

let indexCache: SearchItem[] | null = null;
let indexRequest: Promise<SearchItem[]> | null = null;

function loadSearchIndex(): Promise<SearchItem[]> {
  if (indexCache) return Promise.resolve(indexCache);
  if (!indexRequest) {
    indexRequest = fetch(INDEX_URL)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: SearchItem[]) => {
        indexCache = data;
        return data;
      })
      .catch(() => {
        // Allow a later attempt to retry rather than caching the failure.
        indexRequest = null;
        return [];
      });
  }
  return indexRequest;
}

/** Split `text` around every case-insensitive occurrence of `query` and
 *  wrap each match in a <mark> for visual highlighting. */
function Highlighted({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={i}
            className="bg-primary/20 text-foreground-bright rounded-sm px-0.5 font-semibold not-italic"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export default function SearchPalette({ inDocs: inDocsProp = false }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [index, setIndex] = useState<SearchItem[] | null>(indexCache);
  const [selectedIndex, setSelectedIndex] = useState(0);
  // Seeded from the server so the trigger is painted with the page.
  const [inDocs, setInDocs] = useState(inDocsProp);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  // Keep inDocs in sync after every View Transition swap.
  useEffect(() => {
    const check = () => {
      const nowInDocs = document.body.hasAttribute("data-docs");
      setInDocs(nowInDocs);
      if (!nowInDocs) setIsOpen(false);
    };
    document.addEventListener("astro:after-swap", check);
    return () => document.removeEventListener("astro:after-swap", check);
  }, []);

  // Fetch the index when the palette opens (no-op once cached).
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    loadSearchIndex().then((data) => {
      if (!cancelled) setIndex(data.length > 0 ? data : null);
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // Search when query changes
  useEffect(() => {
    if (!index || !query.trim()) {
      setResults(isOpen && index && !query.trim() ? index.slice(0, 8) : []);
      setSelectedIndex(0);
      return;
    }

    const q = query.toLowerCase();
    const scored = index
      .map((item) => {
        let score = 0;
        if (item.title.toLowerCase().includes(q)) score += 10;
        if (item.title.toLowerCase().startsWith(q)) score += 5;
        if (item.chapter?.toLowerCase().includes(q)) score += 3;
        if (item.body.toLowerCase().includes(q)) score += 1;
        return { item, score };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((s) => s.item);

    setResults(scored);
    setSelectedIndex(0);
  }, [query, index, isOpen]);

  // Global keyboard shortcuts — use functional updater for isOpen so the
  // handler never holds a stale closure value.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }
      if (e.key === "Escape") {
        setIsOpen((prev) => {
          if (prev) e.preventDefault();
          return false;
        });
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Focus the input on open, lock background scrolling, and hand focus back to
  // whatever triggered the palette on close.
  useEffect(() => {
    if (isOpen) {
      restoreFocusRef.current = document.activeElement as HTMLElement | null;
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => inputRef.current?.focus());
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
    setQuery("");
    restoreFocusRef.current?.focus?.();
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    const item = listRef.current?.children[selectedIndex] as
      HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const goTo = useCallback((slug: string) => {
    setIsOpen(false);
    navigate(`/docs/${slug}`);
  }, []);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      goTo(results[selectedIndex].slug);
    }
  };

  const getSnippet = (body: string, q: string): string => {
    if (!q.trim()) return "";
    const lower = body.toLowerCase();
    const idx = lower.indexOf(q.toLowerCase());
    if (idx === -1) return "";
    const start = Math.max(0, idx - 40);
    const end = Math.min(body.length, idx + q.length + 80);
    return (
      (start > 0 ? "..." : "") +
      body.slice(start, end) +
      (end < body.length ? "..." : "")
    );
  };

  const isMac =
    typeof navigator !== "undefined" &&
    /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
  const shortcutLabel = isMac ? "⌘K" : "Ctrl K";

  // Warm the index before the palette is even opened, so the first search is
  // instant for anyone who hovers the trigger first.
  const prefetch = () => void loadSearchIndex();

  const activeOptionId = results[selectedIndex]
    ? `search-option-${selectedIndex}`
    : undefined;

  return (
    <>
      {/* Desktop trigger — looks like a compact search bar */}
      {inDocs && (
        <button
          onClick={() => setIsOpen(true)}
          onMouseEnter={prefetch}
          onFocus={prefetch}
          className="border-border bg-surface hover:bg-surface-hover text-foreground-muted hidden cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors md:flex"
          aria-label="Search documentation"
        >
          <svg
            className="h-4 w-4 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <span className="hidden lg:inline">Search docs...</span>
          <kbd className="bg-background-secondary text-foreground-muted rounded px-1.5 py-0.5 text-xs font-medium">
            {shortcutLabel}
          </kbd>
        </button>
      )}

      {/* Mobile trigger — icon only */}
      {inDocs && (
        <button
          onClick={() => setIsOpen(true)}
          onMouseEnter={prefetch}
          onFocus={prefetch}
          className="text-foreground-secondary hover:text-foreground-bright flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors md:hidden"
          aria-label="Search documentation"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[15vh]"
          role="dialog"
          aria-modal="true"
          aria-label="Search documentation"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Palette */}
          <div className="bg-surface border-border relative z-10 w-full max-w-lg overflow-hidden rounded-xl border shadow-2xl">
            {/* Search input */}
            <div className="border-border flex items-center gap-3 border-b px-4 py-3">
              <svg
                className="text-foreground-muted h-5 w-5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onInput={(e) => setQuery(e.currentTarget.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search documentation..."
                className="text-foreground placeholder-foreground-muted min-w-0 flex-1 bg-transparent text-sm outline-none"
                autoComplete="off"
                spellcheck={false}
                role="combobox"
                aria-expanded="true"
                aria-controls="search-results"
                aria-autocomplete="list"
                aria-activedescendant={activeOptionId}
                aria-label="Search documentation"
              />
              <kbd
                className="bg-background-secondary text-foreground-muted shrink-0 cursor-pointer rounded px-1.5 py-0.5 text-xs"
                onClick={() => setIsOpen(false)}
              >
                ESC
              </kbd>
            </div>

            {/* Results */}
            <ul
              ref={listRef}
              id="search-results"
              className="max-h-80 overflow-y-auto p-2"
              role="listbox"
              aria-label="Search results"
            >
              {results.length === 0 && query.trim() && (
                <li className="text-foreground-muted px-3 py-6 text-center text-sm">
                  No results for &ldquo;{query}&rdquo;
                </li>
              )}
              {results.length === 0 && !query.trim() && !index && (
                <li className="text-foreground-muted px-3 py-6 text-center text-sm">
                  Loading...
                </li>
              )}
              {results.map((item, i) => {
                const snippet = getSnippet(item.body, query);
                return (
                  <li
                    key={item.slug}
                    id={`search-option-${i}`}
                    role="option"
                    aria-selected={i === selectedIndex}
                    onClick={() => goTo(item.slug)}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={`cursor-pointer rounded-lg px-3 py-2.5 text-left transition-colors ${
                      i === selectedIndex
                        ? "bg-primary/10 text-foreground-bright"
                        : "text-foreground hover:bg-primary/5"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        <Highlighted text={item.title} query={query} />
                      </span>
                      {item.chapter && (
                        <span className="text-foreground-muted bg-background-secondary rounded px-1.5 py-0.5 text-[0.65rem]">
                          {item.chapter}
                        </span>
                      )}
                    </div>
                    {snippet && (
                      <p className="text-foreground-secondary mt-1 line-clamp-1 text-xs">
                        <Highlighted text={snippet} query={query} />
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Footer */}
            <div className="border-border text-foreground-muted flex items-center gap-4 border-t px-4 py-2 text-xs">
              <span>
                <kbd className="bg-background-secondary rounded px-1 py-0.5">
                  ↑↓
                </kbd>{" "}
                navigate
              </span>
              <span>
                <kbd className="bg-background-secondary rounded px-1 py-0.5">
                  ↵
                </kbd>{" "}
                open
              </span>
              <span>
                <kbd className="bg-background-secondary rounded px-1 py-0.5">
                  esc
                </kbd>{" "}
                close
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
