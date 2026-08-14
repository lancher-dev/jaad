<h1 align="center">JAAD</h1>
<p align="center"><b>Just Another Astro Docs</b>. Write markdown. Get docs.</p>

An Astro integration that turns a folder of markdown into a documentation site. No sidebar to configure, no frontmatter to write, no files to move.

## Install

```bash
npm install jaad
```

```ts
// jaad.config.ts
import { defineJaadConfig } from "jaad";

export default defineJaadConfig({
  site: "https://example.dev",
  title: "My Project",
});
```

```js
// astro.config.mjs
export { default } from "jaad/site";
```

```ts
// src/content.config.ts
export { collections } from "jaad/content";
```

Then write markdown in `docs/`:

```
docs/
  01-introduction.md   → /docs/introduction
  02-guides/           → chapter "Guides"
    01-setup.md        → /docs/guides/setup
```

Numbers set the order and are stripped from the URL. Folders become chapters. The first `# Heading` is the page title.

## What it does

Sidebar and page navigation from the file tree. Per-page table of contents. Full-text search. Light and dark themes. Syntax highlighting. Sitemap, `llms.txt`, and the raw markdown of every page served alongside it.

The repository link, the "Edit this page" URL, the description and the favicon are read from the project rather than configured.

## Documentation

[jaad.lancher.dev](https://jaad.lancher.dev)

## Status

Early. The API may change between minor versions while the shape settles.

## License

jaad is released under the [MIT License](./LICENSE).
