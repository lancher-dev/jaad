import { useState, useEffect, useRef, useCallback } from "react";

interface SearchItem {
  title: string;
  slug: string;
  chapter: string | null;
  body: string;
}

/** Read the static search index embedded in the page by DocsLayout. */
function readSearchIndex(): SearchItem[] {
  const el = document.getElementById("jaad-search-index");
  if (!el?.textContent) return [];
  try {
    return JSON.parse(el.textContent) as SearchItem[];
  } catch {
    return [];
  }
}

export default function SearchPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [index, setIndex] = useState<SearchItem[] | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Parse embedded index on first open
  useEffect(() => {
    if (isOpen && !index) {
      setIndex(readSearchIndex());
    }
  }, [isOpen, index]);

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

  // Global keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    const item = listRef.current?.children[selectedIndex] as
      | HTMLElement
      | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const navigate = useCallback((slug: string) => {
    setIsOpen(false);
    window.location.href = `/docs/${slug}`;
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      navigate(results[selectedIndex].slug);
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
    typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
  const shortcutLabel = isMac ? "⌘K" : "Ctrl K";

  return (
    <>
      {/* Desktop trigger — looks like a compact search bar */}
      <button
        onClick={() => setIsOpen(true)}
        className="border-border bg-surface hover:bg-surface-hover text-foreground-muted hidden cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors md:flex"
        aria-label="Search documentation"
      >
        <svg
          className="h-4 w-4 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
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

      {/* Mobile trigger — icon only */}
      <button
        onClick={() => setIsOpen(true)}
        className="text-foreground-secondary hover:text-foreground-bright flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors md:hidden"
        aria-label="Search documentation"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[15vh]">
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
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search documentation..."
                className="text-foreground placeholder-foreground-muted min-w-0 flex-1 bg-transparent text-sm outline-none"
                autoComplete="off"
                spellCheck={false}
              />
              <kbd
                className="bg-background-secondary text-foreground-muted shrink-0 rounded px-1.5 py-0.5 text-xs"
                onClick={() => setIsOpen(false)}
              >
                ESC
              </kbd>
            </div>

            {/* Results */}
            <ul
              ref={listRef}
              className="max-h-80 overflow-y-auto p-2"
              role="listbox"
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
                  <li key={item.slug} role="option" aria-selected={i === selectedIndex}>
                    <button
                      onClick={() => navigate(item.slug)}
                      onMouseEnter={() => setSelectedIndex(i)}
                      className={`w-full cursor-pointer rounded-lg px-3 py-2.5 text-left transition-colors ${
                        i === selectedIndex
                          ? "bg-primary/10 text-foreground-bright"
                          : "text-foreground hover:bg-primary/5"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {item.title}
                        </span>
                        {item.chapter && (
                          <span className="text-foreground-muted bg-background-secondary rounded px-1.5 py-0.5 text-[0.65rem]">
                            {item.chapter}
                          </span>
                        )}
                      </div>
                      {snippet && (
                        <p className="text-foreground-secondary mt-1 line-clamp-1 text-xs">
                          {snippet}
                        </p>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Footer */}
            <div className="border-border text-foreground-muted flex items-center gap-4 border-t px-4 py-2 text-xs">
              <span>
                <kbd className="bg-background-secondary rounded px-1 py-0.5">↑↓</kbd> navigate
              </span>
              <span>
                <kbd className="bg-background-secondary rounded px-1 py-0.5">↵</kbd> open
              </span>
              <span>
                <kbd className="bg-background-secondary rounded px-1 py-0.5">esc</kbd> close
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
