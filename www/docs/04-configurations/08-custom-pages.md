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

## Migrating from Base

`@lancher-dev/jaad/layouts/Base.astro` is deprecated in JAAD 0.7 and will be
removed in 0.8. Move its application markup into a local Astro layout and
replace imports from the package.

To restructure documentation pages, use
[Advanced layout](/docs/configurations/advanced-layout).
