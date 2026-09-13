# Repository guide

A website with its own documentation. The documentation is built with
[JAAD](https://jaad.lancher.dev), an Astro integration that turns the `docs/`
folder into pages mounted at `/docs`; the landing page at `/` is an ordinary
Astro page. No component is needed for a documentation page: a markdown file
in `docs/` is a page.

## Development

Start the dev server in background mode:

```
astro dev --background
```

Manage it with `astro dev stop`, `astro dev status` and `astro dev logs`.
Build the site with `astro build`.

## Layout

| Path                    | What it is                                        |
| ----------------------- | ------------------------------------------------- |
| `docs/`                 | The markdown that becomes the site                |
| `jaad.config.ts`        | Every JAAD option                                 |
| `src/jaad.css`          | Colours, fonts and widths (create it if absent)   |
| `astro.config.mjs`      | Re-exports JAAD's Astro config; leave it alone    |
| `src/content.config.ts` | Re-exports JAAD's collection; leave it alone      |
| `src/pages/`            | Pages of your own, starting with the landing page |
| `src/layouts/`          | The layout those pages use                        |

Pages in `src/pages/` keep their own layout, styles and metadata: JAAD's
options apply to documentation pages only. `routeBase: "/docs"` in
`jaad.config.ts` is what keeps `/` free for the landing page.

## Writing pages

- A numeric prefix sets the order and is stripped from the URL:
  `02-guide.md` becomes `/docs/guide`.
- A folder becomes a chapter. Only one level of nesting is supported,
  per language.
- The first `# Heading` is the page title; `##` and `###` build the table of
  contents.
- The first page in sort order opens at `/docs`, and its named URL redirects
  there.
- Removing the prefixes must leave every page with a unique path, or the build
  stops and names the conflicting files.

Frontmatter is optional, and each field overrides something the file tree or
the body already supplies:

```markdown
---
title: Images & Videos # page title; the filename still sets the URL
label: Media # shorter name, in navigation only
description: Add accessible images. # description metadata
keywords: [markdown, media] # keyword metadata and search weight
author: Ada Lovelace # author metadata
ogImage: /og/media.png # social image for this page
lastUpdated: 2026-09-12 # modification date in metadata
order: 5 # replaces the number in the filename
draft: false # true keeps it out of the build
---
```

## More than one language

Name the directories directly under `docs/` after language codes — `docs/en/`,
`docs/it/` — and JAAD builds one site per language with a switcher in the
header. `lang` in `jaad.config.ts` names the one that keeps the unprefixed
urls. Two directories are the threshold; a single one counts only when `lang`
names it.

## Changing the site

Title, logo, navigation, social links, footer and theme are options in
`jaad.config.ts`. Colours, fonts and layout widths are CSS custom properties
in `src/jaad.css`. Reach for a custom `src/jaad/DocsFrame.astro` only when the
structure itself has to change.

## Documentation

Full documentation: https://jaad.lancher.dev

Consult these guides before working on related tasks:

- [Creating pages](https://jaad.lancher.dev/docs/getting-started/creating-pages)
- [Structure and navigation](https://jaad.lancher.dev/docs/configurations/structure)
- [Frontmatter](https://jaad.lancher.dev/docs/configurations/frontmatter)
- [Markdown features](https://jaad.lancher.dev/docs/markdown)
- [Languages](https://jaad.lancher.dev/docs/configurations/i18n)
- [Search](https://jaad.lancher.dev/docs/configurations/search)
- [Fonts](https://jaad.lancher.dev/docs/configurations/fonts)
- [Configuration reference](https://jaad.lancher.dev/docs/configurations/reference)
- [Styles](https://jaad.lancher.dev/docs/configurations/styles) and [themes](https://jaad.lancher.dev/docs/configurations/themes)
- [Pages of your own](https://jaad.lancher.dev/docs/configurations/custom-pages)
- [Advanced layout](https://jaad.lancher.dev/docs/configurations/advanced-layout)
- [Deployment](https://jaad.lancher.dev/docs/getting-started/deployment)
