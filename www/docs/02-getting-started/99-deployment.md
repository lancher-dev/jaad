# Deployment

A JAAD site builds to static HTML, so it deploys anywhere that serves files.

```bash
npm run build      # writes ./dist
npm run preview    # serves ./dist locally
```

## Before you deploy

Set `site` in `jaad.config.ts` to the final URL. Canonical links, the sitemap and social card images are all built from it, and without it they are omitted.

```ts
// jaad.config.ts
export default defineJaadConfig({
  site: "https://docs.example.dev",
  title: "My Project",
});
```

If the site is served from a subpath rather than a domain root, set `base` too:

```ts
export default defineJaadConfig({
  site: "https://me.github.io",
  base: "/my-repo",
  title: "My Project",
});
```

## GitHub Pages

Enable Pages for the repository with **GitHub Actions** as the source, then add this workflow:

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

> [!IMPORTANT]
> The "Edit this page" link is derived from the git remote and the branch that is checked out. Deploying from a detached or shallow checkout still works, and the link is left out when the remote cannot be read.

## Everywhere else

Netlify, Vercel, Cloudflare Pages and the like need no workflow: build command `npm run build`, publish directory `dist`.

For a plain web server, copy `dist/` behind any static host.

## What gets built

Alongside the pages, JAAD emits:

- `sitemap-index.xml`: written when `site` is set
- `search-index.json`: fetched by the search palette on first use
- `llms.txt`: a plain-text index of every page, following the [llms.txt convention](https://llmstxt.org)
- `/**.md`: the raw markdown of every page, at its named URL with a `.md` extension (or below `routeBase` when configured)
