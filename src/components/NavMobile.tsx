import { useState, useEffect, useRef } from "react";

export default function NavMobile() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  return (
    <div ref={ref} className="relative md:hidden">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="text-foreground-secondary hover:text-foreground-bright flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors"
        aria-label="Toggle mobile menu"
        aria-expanded={isOpen}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {isOpen && (
        <div className="bg-surface border-border absolute top-full right-0 z-40 mt-2 w-44 overflow-hidden rounded-xl border shadow-lg">
          <nav className="p-2">
            <ul className="flex flex-col gap-1">
              <li>
                <a
                  href="/docs"
                  className="text-foreground-secondary hover:text-foreground-bright hover:bg-primary/5 block rounded-lg px-3 py-2 text-sm no-underline transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Docs
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/lancher-dev/jaad"
                  className="text-foreground-secondary hover:text-foreground-bright hover:bg-primary/5 block rounded-lg px-3 py-2 text-sm no-underline transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                >
                  Repository
                </a>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
