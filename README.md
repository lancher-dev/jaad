# JAAD

**Just Another Astro Docs** - Write markdown. Get docs.

JAAD transforms markdown files into clean, navigable documentation with automatic sidebar generation and table of contents.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## How It Works

Place markdown files in `docs/` with numbered prefixes. Files like `01-getting-started.md` become `/docs/getting-started` with the number controlling sidebar order. The framework handles navigation, TOC extraction, and responsive layouts automatically.

## Structure

```
docs/
  01-page.md              → /docs/page
  02-chapter/
    01-section.md         → /docs/chapter/section
```

Folders create chapters. Numbers control order. Everything else is automatic.

## License

MIT
