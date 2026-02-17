import { useState } from "react";

export default function NavMobile() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-foreground-secondary hover:text-foreground-bright transition-colors md:hidden"
        aria-label="Toggle mobile menu"
        aria-expanded={isOpen}
      >
        <svg
          className="h-6 w-6"
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

      <div
        className={`col-span-2 overflow-hidden transition-all duration-300 ease-in-out md:hidden ${
          isOpen ? "mt-4 max-h-48 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="border-primary/10 border-t pt-4">
          <ul className="flex flex-col space-y-3">
            <li>
              <a
                href="/docs"
                className="text-foreground-secondary hover:text-foreground-bright block transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Docs
              </a>
            </li>
            <li>
              <a
                href="https://github.com/lancher-dev/jaad"
                className="text-foreground-secondary hover:text-foreground-bright block transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Repository
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}
