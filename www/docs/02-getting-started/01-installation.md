# Installation

JAAD is an [Astro](https://astro.build) integration. You add it to a project, point it at a folder of markdown, and get a documentation site.

## Add it to a project

Start from an empty Astro project, or an existing one.

:::code-tabs

```bash npm
npm create astro@latest my-docs -- --template minimal --no-install --no-git
cd my-docs
npm install jaad
```

```bash pnpm
pnpm create astro@latest my-docs --template minimal --no-install --no-git
cd my-docs
pnpm add jaad
```

```bash yarn
yarn create astro my-docs --template minimal --no-install --no-git
cd my-docs
yarn add jaad
```

:::

> [!NOTE]
> Node.js 18 or higher is required, along with Astro 7. JAAD declares Astro as a peer dependency, so it uses the copy already in your project.

## Wire it up

Two files, and neither of them is long.

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import jaad from "jaad";

export default defineConfig({
  site: "https://example.dev",
  integrations: [jaad({ title: "My Project" })],
});
```

```ts
// src/content.config.ts
export { collections } from "jaad/content";
```

`title` is the only required option. Everything else has a default, and several things are worked out from the repository itself. See [Configuration](/docs/configurations/reference).

> [!IMPORTANT]
> Set `site` in `astro.config.mjs`. Without it Astro cannot build absolute URLs, so canonical links and social card images are left out.

## Write something

Create a `docs/` folder in the project root and put a markdown file in it.

```
docs/
  01-introduction.md   → /docs/introduction
  02-guide.md          → /docs/guide
  03-advanced/         → chapter "Advanced"
    01-config.md       → /docs/advanced/config
```

Numbers set the order and are stripped from the URL. Folders become chapters. The first `# Heading` in each file becomes the page title. No frontmatter is required, and there is no sidebar to configure.

If your markdown already lives somewhere else, point `docsDir` at it instead of moving it:

```js
jaad({ title: "My Project", docsDir: "./documentation" });
```

## Run it

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

The site starts at `http://localhost:4321`, with the documentation at `/docs`. Saving a markdown file reloads the browser.

## What you did not have to do

No sidebar configuration. No frontmatter. No moving files into `src/content/`. No component wiring. That is the whole point: if you already have a folder of markdown, you are three lines away from a site.
