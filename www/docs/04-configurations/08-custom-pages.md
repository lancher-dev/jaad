# Pages outside the documentation

Anything outside `docs/` is an ordinary Astro page in `src/pages/`. It owns
its layout, styles and metadata just like it would in a project without JAAD.
Options such as `nav`, `footer`, `theme` and `appearance` configure the
documentation interface only.

For a new project, the `site` template creates a local layout and landing page,
then mounts the documentation at `/docs`:

```bash
npm create @lancher-dev/jaad@latest my-site -- --template site
```

```
src/
  layouts/
    SiteLayout.astro
  pages/
    index.astro
docs/
  01-introduction.md
```

Both files under `src/` belong to the application. Edit or replace them freely;
they do not import JAAD components or inherit its documentation chrome.

## Adding another page

Use the local site layout as you would use any Astro layout:

```astro
---
// src/pages/pricing.astro
import SiteLayout from "../layouts/SiteLayout.astro";
---

<SiteLayout pageTitle="Pricing">
  <h1>Pricing</h1>
</SiteLayout>
```

JAAD continues to provide the documentation pages, search index, `llms.txt` and
raw Markdown routes below `routeBase`, plus the sitemap integration. It does
not impose routes, markup or styling on the rest of the application.

## Migrating from the packaged Base layout

`@lancher-dev/jaad/layouts/Base.astro` is deprecated in JAAD 0.7 and will be
removed in 0.8. Move its application-specific markup into a local Astro layout,
then replace imports from the package with that local file.

This separation also means that changing documentation widths or hiding its
footer cannot accidentally redesign a landing or product page.

To change the structure of the documentation itself, see
[Advanced layout](/docs/configurations/advanced-layout).
