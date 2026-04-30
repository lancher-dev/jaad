# Search

JAAD includes a built-in search palette that lets readers find any page in the documentation. It opens with `Ctrl+K` (or `⌘K` on macOS) and is also accessible from the search button in the header.

## How it works

The search index is built at compile time from the markdown collection and embedded as static JSON in every docs page. When the palette opens for the first time, the React component reads the index from the DOM — no network request, no server.

Results are scored by title match, chapter match, and body match. The palette shows up to 10 results with keyboard navigation (`↑` `↓` to move, `Enter` to open, `Esc` to close).

## What is indexed

Every `.md` file in the `docs/` directory is included. The index contains:

- **Title** — from frontmatter, first `# Heading`, or filename
- **Chapter** — the parent folder name, if any
- **Body** — plain text with markdown syntax stripped

Code blocks, images, and directives are removed from the body before indexing.

## Responsive behavior

On desktop, the header shows a compact search bar with the keyboard shortcut hint. On mobile, it collapses to a search icon. Both open the same full-screen overlay palette.
