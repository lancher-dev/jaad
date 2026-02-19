# Overview

**JAAD** (Just Another Astro Docs) is a minimal, file-driven documentation framework. Drop markdown files into a folder, run one command, and get a fully functional documentation site — complete with sidebar navigation, per-page table of contents, syntax highlighting, and responsive layout.

It is intentionally thin: no CMS, no database, no special frontmatter required. The file system is the source of truth.

## Why JAAD

Most documentation frameworks ask you to configure a lot before writing a single word. JAAD inverts this: the only things you need to know upfront are how to name a file and how to write markdown.

The result is a site that stays out of your way while you write, and produces clean, readable output when you're done.

## Built on

JAAD is assembled from a small set of well-established tools:

| Tool                                     | Role                                                   |
| ---------------------------------------- | ------------------------------------------------------ |
| [Astro](https://astro.build)             | Static site generator and build pipeline               |
| [Markdown / MDX](https://commonmark.org) | Content format — standard CommonMark + GFM extensions  |
| [Tailwind CSS](https://tailwindcss.com)  | Utility-first styling                                  |
| [React](https://react.dev)               | Interactive components (table of contents, mobile nav) |
| [Shiki](https://shiki.style)             | Syntax highlighting inside code blocks                 |

Being built on Astro means you get everything Astro provides for free: fast static builds, view transitions, image optimization, and a large ecosystem of integrations. Anything not covered in this documentation can be found in the [Astro docs](https://docs.astro.build).

## What JAAD handles for you

- **Sidebar navigation** — generated automatically from the file and folder structure in `docs/`. Numbered prefixes control order; they are stripped from URLs.
- **Table of contents** — built from the `##` and `###` headings of each page. Highlights the active section as you scroll.
- **Syntax highlighting** — via Shiki with a warm paper theme, consistent across all code blocks.
- **Markdown extensions** — GitHub-style alerts (`NOTE`, `TIP`, `WARNING`, …), tabbed code blocks, collapsible sections, and more, all documented in the [Markdown Reference](/docs/markdown/reference).
- **Responsive layout** — sidebar and ToC collapse gracefully on mobile.

## What you configure

Almost nothing. The two values worth setting in `astro.config.mjs` before going live are:

```js
export default defineConfig({
  site: "https://your-domain.com", // used for OG tags and sitemaps
  base: "/", // change if deploying to a subdirectory
});
```

Everything else has sensible defaults.

> [!TIP]
> For advanced customisation — custom components, integrations, deployment targets — refer to the [Astro documentation](https://docs.astro.build). JAAD is a standard Astro project under the hood.
