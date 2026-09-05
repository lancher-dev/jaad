# Installation

## Create a project

```bash
npm create @lancher-dev/jaad@latest
```

The CLI asks for a destination, template, title and whether to install
dependencies. Choose `docs` for documentation at `/`, or `site` for a landing
page at `/` and documentation at `/docs`.

To provide every answer as flags:

```bash
npm create @lancher-dev/jaad@latest my-docs -- --template docs --title "My Docs" --install
```

Use `--here` inside an existing repository:

```bash
npm create @lancher-dev/jaad@latest -- --here --template site
```

The command keeps the existing `package.json` and Markdown files. It stops
without writing when a custom Astro or Content configuration requires a manual
merge.

> [!NOTE]
> Non-interactive environments require a destination or `--here`, `--template`,
> `--title`, and either `--install` or `--no-install`.

## Run locally

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

The development server starts at `http://localhost:4321`.

Add pages to `docs/`, following the conventions in
[Creating pages](/docs/getting-started/creating-pages).

## Manual installation

Install JAAD in an Astro 7 project running Node.js 22.12 or later:

:::code-tabs

```bash npm
npm install @lancher-dev/jaad
```

```bash pnpm
pnpm add @lancher-dev/jaad
```

```bash yarn
yarn add @lancher-dev/jaad
```

:::

Add the following files:

```ts
// jaad.config.ts
import { defineJaadConfig } from "@lancher-dev/jaad";

export default defineJaadConfig({
  site: "https://example.dev",
  title: "My Project",
});
```

```js
// astro.config.mjs
export { default } from "@lancher-dev/jaad/site";
```

```ts
// src/content.config.ts
export { collections } from "@lancher-dev/jaad/content";
```

Only `title` is required. See the
[configuration reference](/docs/configurations/reference) for the remaining
options.

## Existing Astro project

If `--here` reports custom `astro.config.*` or `src/content.config.*` files,
keep their existing configuration and merge JAAD manually.

Add the integration to the Astro configuration:

```ts
// astro.config.ts
import { defineConfig } from "astro/config";
import jaad from "@lancher-dev/jaad";
import jaadConfig from "./jaad.config";

export default defineConfig({
  site: jaadConfig.site,
  base: jaadConfig.base,
  integrations: [jaad(jaadConfig)],
});
```

`jaad()` returns integrations only. `site` and `base` are lifted above, and the
[`astro`](/docs/configurations/reference#extending-astro) field is ignored here.
Write those options in `defineConfig`.

If the project defines content collections, add JAAD's collection without
replacing them:

```ts
// src/content.config.ts
import { defineCollection } from "astro:content";
import { collections as jaadCollections } from "@lancher-dev/jaad/content";

const blog = defineCollection({/* existing loader and schema */});

export const collections = {
  blog,
  ...jaadCollections,
};
```

The collection name `docsPages` is reserved for JAAD.

Create `docs/`, add a Markdown page, then run the project with its existing
development script.
