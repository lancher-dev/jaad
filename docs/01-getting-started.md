# Getting Started

JAAD transforms markdown files into organized documentation. Place markdown files in the `docs/` directory and the framework handles navigation, table of contents, and URL generation automatically.

## Installation

Clone the repository and install dependencies:

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

Then start the development server:

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

The server runs at `http://localhost:4321` and automatically reloads when you edit markdown files.

## Creating Pages

Create a markdown file in the docs directory with a numbered prefix. The number determines the order in the sidebar, but won't appear in the URL. For example, a file named `01-introduction.md` becomes accessible at `/docs/introduction`.

Write your content using standard markdown syntax. The first level-one heading becomes the page title. Level-two and level-three headings automatically appear in the table of contents on the right side of the page.

## Building & Deployment

Generate the static site for production:

```bash
pnpm build
```

Preview the build locally before deploying:

```bash
pnpm preview
```

JAAD produces a fully static site. For deployment guides (Netlify, Vercel, GitHub Pages, and more) refer to the [official Astro deployment documentation](https://docs.astro.build/en/guides/deploy/).
