# Deployment

JAAD builds a static site in `dist/`:

```bash
npm run build
npm run preview
```

Set `site` to the public URL so JAAD can generate canonical links, the sitemap
and social image URLs. Add `base` when the site is served from a subpath.

```ts
export default defineJaadConfig({
  site: "https://me.github.io",
  base: "/my-repo",
  title: "My Project",
});
```

## GitHub Pages

Select **GitHub Actions** as the Pages source, then add:

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v4
        with:
          node-version: "24"
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

## Other hosts

For Netlify, Vercel, Cloudflare Pages or another static host, use
`npm run build` as the build command and `dist` as the publish directory.

## Generated files

In addition to the pages, the build writes:

- `sitemap-index.xml` when `site` is set;
- `<routeBase>/search-index.json` for search;
- `<routeBase>/llms.txt` as a plain-text page index;
- `<routeBase>/**.md` for raw Markdown routes.
