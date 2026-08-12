# Overview

**JAAD** (_Just Another Astro Docs_) is a minimal, file-driven documentation framework. Drop markdown files into a folder, run one command, and get a fully functional documentation site, complete with sidebar navigation, per-page table of contents, syntax highlighting, and responsive layout.

It is intentionally thin: no CMS, no database, no special frontmatter required. The file system is the source of truth.

## Why JAAD

Most documentation frameworks ask you to configure a lot before writing a single word. JAAD inverts this: the only things you need to know upfront are how to name a file and how to write markdown.

The result is a site that stays out of your way while you write, and produces clean, readable output when you're done.

## Built on

JAAD is assembled from a small set of well-established tools:

| Tool                                     | Role                                                                  |
| ---------------------------------------- | --------------------------------------------------------------------- |
| [Astro](https://astro.build)             | Static site generator and build pipeline                              |
| [Markdown / MDX](https://commonmark.org) | Content format, standard CommonMark + GFM extensions                  |
| [Tailwind CSS](https://tailwindcss.com)  | Utility-first styling                                                 |
| Custom elements                          | Interactive parts (search, theme switch, mobile nav), no UI framework |
| [Shiki](https://shiki.style)             | Syntax highlighting inside code blocks                                |

Being built on Astro means you get everything Astro provides for free: fast static builds, view transitions, image optimization, and a large ecosystem of integrations. Anything not covered in this documentation can be found in the [Astro docs](https://docs.astro.build).

## What you configure

Almost nothing. A working site needs the site URL and a title:

```ts
// jaad.config.ts
import { defineJaadConfig } from "jaad";

export default defineJaadConfig({
  site: "https://your-domain.com",
  title: "My Project",
});
```

Everything else has a default, and several things (the repository link, the "Edit this page" URL, the description, the favicon) are read from the project rather than configured. See [Configuration](/docs/configurations/reference).

> [!TIP]
> JAAD is an ordinary Astro integration, so anything Astro can do you can still do: extra integrations, your own pages, custom deployment targets. Refer to the [Astro documentation](https://docs.astro.build).
