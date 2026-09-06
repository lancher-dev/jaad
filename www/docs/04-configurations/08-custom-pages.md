# Pages outside the documentation

Files in `src/pages/` are regular Astro pages. They keep their own layouts,
styles and metadata; JAAD options affect only documentation below `routeBase`.

The `site` template creates a local layout and landing page, then mounts the
documentation at `/docs`:

```bash
npm create @lancher-dev/jaad@latest my-site -- --template site
```

```
src/
  layouts/SiteLayout.astro
  pages/index.astro
docs/
  01-introduction.md
```

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
the default spacing when the content needs the full width.

This is the site chrome, not the reading layout: there is no sidebar and no
table of contents, because a page outside the documentation has no place in
its navigation. To restructure documentation pages themselves, use
[Advanced layout](/docs/configurations/advanced-layout).

## Migrating from Base

`@lancher-dev/jaad/layouts/Base.astro` was deprecated in JAAD 0.7 and is gone
in 0.8. It never did anything of its own: it forwarded every prop to the page
layout above. Change the import to
`@lancher-dev/jaad/layouts/Page.astro` and leave the rest of the page alone.
