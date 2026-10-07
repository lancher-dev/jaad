# Custom pages

Files in `src/pages/` are regular Astro pages. They keep their own layouts,
styles and metadata; JAAD options affect only documentation below `routeBase`.

The `site` template creates a local layout and landing page, then mounts the
documentation at `/docs`:

:::code-tabs

```bash npm
npm create @lancher-dev/jaad@latest my-site -- --template site
```

```bash pnpm
pnpm create @lancher-dev/jaad@latest my-site --template site
```

```bash yarn
yarn create @lancher-dev/jaad@latest my-site --template site
```

```bash bun
bun create @lancher-dev/jaad@latest my-site --template site
```

:::

```
src/
  layouts/SiteLayout.astro
  pages/index.astro
  styles/site.css
  utils/base.ts
public/
  favicon.svg
docs/
  01-introduction.md
tsconfig.json
```

`utils/base.ts` exports `withBase()`, which applies Astro's deployment base to
a root-relative href. Use it for every link the layout writes, so the site keeps
working when it moves to a subpath.

Use the generated layout for other application pages:

```astro
---
import SiteLayout from "../layouts/SiteLayout.astro";
---

<SiteLayout pageTitle="Pricing">
  <h1>Pricing</h1>
</SiteLayout>
```

JAAD still generates documentation pages, search, `llms.txt`, raw Markdown
routes and the sitemap without controlling the rest of the application.

## Keeping JAAD's header and footer

A site with a landing page of its own wants its own identity, and a local
layout is the right answer for it. A documentation-first site is the other
case: when `routeBase` is `/` and you add one page beside the documentation —
a changelog, a pricing page — rebuilding the header and footer to match would
be work spent on looking the same.

Import the page layout instead:

```astro
---
import Page from "@lancher-dev/jaad/layouts/Page.astro";
---

<Page title="Changelog">
  <h1>Changelog</h1>
</Page>
```

It renders the documentation header and footer, the theme, and your
configuration's title, navigation and social links around whatever you put
inside. `title` and `description` set the metadata for the page; `bare` drops
the default spacing when the content needs the full width; `class` is added to
the body.

Search comes with the header. A documentation page shows the full search field;
a page outside the documentation shows the magnifier alone, because
<kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>K</kbd> opens the palette there too and the
icon is what says so. Clicking it opens the same palette.

This is the site chrome, not the reading layout: there is no sidebar and no
table of contents, because a page outside the documentation has no place in
its navigation. To restructure documentation pages themselves, use
[Advanced layout](/docs/configurations/advanced-layout).

## Matching the documentation's layout

- `.jaad-chrome`: the column shared by header, footer and documentation
  content, as wide as `--jaad-chrome-width`.
- `.jaad-main`: vertical margin and horizontal padding of the main landmark.
  `bare` swaps it for `.jaad-main-bare`, which has none.
- Layout tokens (`--jaad-content-width`, `--jaad-page-padding`, …) are listed
  in [Styles](/docs/configurations/styles).

```astro
<Page title="Changelog">
  <div class="jaad-chrome">…</div>
</Page>
```

## Tailwind

With `tailwind: true`, utilities on `Page` pages use JAAD's tokens. See
[Styles](/docs/configurations/styles#tailwind).
