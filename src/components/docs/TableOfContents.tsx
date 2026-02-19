import type { DocsHeadings } from "@/@types/docs";
import { useEffect, useState } from "react";

interface Props {
  headings: DocsHeadings[];
}

function isIgnored(el: Element | null): boolean {
  if (!el) return true;
  return !!el.closest("[data-toc-ignore], pre, code");
}

export default function TableOfContents({ headings }: Props) {
  const [activeId, setActiveId] = useState<string>("");
  const [visibleHeadings, setVisibleHeadings] = useState<DocsHeadings[] | null>(
    null,
  );

  useEffect(() => {
    setVisibleHeadings(
      headings.filter((h) => !isIgnored(document.getElementById(h.slug))),
    );

    const headingElements = Array.from(
      document.querySelectorAll("#content h2, #content h3"),
    ).filter((el) => !isIgnored(el));
    if (!headingElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -66%", threshold: 0 },
    );

    headingElements.forEach((heading) => observer.observe(heading));

    return () => {
      headingElements.forEach((heading) => observer.unobserve(heading));
    };
  }, [headings]);

  if (!visibleHeadings || visibleHeadings.length === 0) return null;

  return (
    <aside
      id="toc-sidebar"
      className="docs-sidebar-right fixed top-0 right-0 hidden h-screen w-64 overflow-y-auto px-6 py-8 pt-24 lg:block"
    >
      <nav aria-label="Table of contents">
        <h2 className="text-primary/60 mb-4 text-xs font-semibold tracking-wider uppercase">
          On This Page
        </h2>
        <ul className="space-y-2">
          {visibleHeadings.map((heading) => {
            const isH3 = heading.depth === 3;
            const isActive = activeId === heading.slug;

            return (
              <li key={heading.slug}>
                <a
                  href={`#${heading.slug}`}
                  className={`text-foreground/60 hover:text-primary block border-l-2 py-1 text-xs no-underline transition-colors ${
                    isH3 ? "pl-6" : "pl-3"
                  } ${isActive ? "border-primary" : "border-transparent"}`}
                >
                  {heading.text}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
