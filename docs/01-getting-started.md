# Getting Started

## Installation

JAAD is a standard [Astro](https://astro.build) project. Clone the repository and install dependencies with your preferred package manager:

:::code-tabs

```bash npm
npm install
```

```bash pnpm
pnpm install
```

```bash yarn
yarn install
```

:::

> [!NOTE]
> Node.js 18 or higher is required. See the [Astro installation guide](https://docs.astro.build/en/install-and-setup/) for full system requirements.

## Local development

Start the dev server:

:::code-tabs

```bash npm
npm run dev
```

```bash pnpm
pnpm dev
```

```bash yarn
yarn dev
```

:::

The server starts at `http://localhost:4321`. The browser reloads automatically whenever you save a markdown file.

Astro handles all file watching, hot reloading, and module bundling. If you need to configure the dev server port, proxy settings, or any other runtime behaviour, refer to the [Astro dev server docs](https://docs.astro.build/en/reference/cli-reference/#astro-dev).

## Creating pages

Create a markdown file in `docs/` with a numbered prefix. The number controls the order in the sidebar; it is stripped from the URL.

```
docs/
  01-introduction.md   → /docs/introduction
  02-guide.md          → /docs/guide
  03-advanced/         → sidebar section "Advanced"
    01-config.md       → /docs/advanced/config
    02-plugins.md      → /docs/advanced/plugins
```

The first `# Heading` in each file becomes the page title. `##` and `###` headings appear automatically in the table of contents.

## Building & deployment

Generate the production build:

```bash
pnpm build
```

Preview it locally before publishing:

```bash
pnpm preview
```

The output in `dist/` is a fully static site with no server-side requirements. For hosting guides (Netlify, Vercel, GitHub Pages, Cloudflare Pages, …) see the [Astro deployment documentation](https://docs.astro.build/en/guides/deploy/).
