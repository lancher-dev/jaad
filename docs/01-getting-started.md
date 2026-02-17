# Getting Started

JAAD transforms markdown files into organized documentation. Place markdown files in the `docs/` directory and the framework handles navigation, table of contents, and URL generation automatically.

## Installation

Clone or download this repository, then install dependencies:

```bash
pnpm install
```

Start the development server to preview your documentation:

```bash
pnpm dev
```

The server runs at `http://localhost:4321` and automatically reloads when you edit markdown files.

## Creating Pages

Create a markdown file in the docs directory with a numbered prefix. The number determines the order in the sidebar, but won't appear in the URL. For example, a file named `01-introduction.md` becomes accessible at `/docs/introduction`.

Write your content using standard markdown syntax. The first level-one heading becomes the page title. Level-two and level-three headings automatically appear in the table of contents on the right side of the page.

## Building

Generate the static site for production:

```bash
pnpm build
```

Preview the production build locally:

```bash
pnpm preview
```

The generated files in the `dist/` directory can be deployed to any static hosting service.
