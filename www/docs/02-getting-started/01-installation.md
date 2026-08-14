# Installation

JAAD is an [Astro](https://astro.build) integration. You add it to a project, point it at a folder of markdown, and get a documentation site.

## The short way

```bash
npm create @lancher-dev/jaad@latest my-docs
```

That writes every file below for you and installs. If the repository you want to document already has a `docs/` folder, run it there instead:

```bash
npm create @lancher-dev/jaad@latest -- --here
```

It adds JAAD to the project you already have, keeps your `package.json` as it is, and leaves your existing markdown alone.

The rest of this page is the same thing by hand, which is worth reading once so you know what those files do.

## Add it to a project

Start from an empty Astro project, or an existing one.

:::code-tabs

```bash npm
npm create astro@latest my-docs -- --template minimal --no-install --no-git
cd my-docs
npm install @lancher-dev/jaad
```

```bash pnpm
pnpm create astro@latest my-docs --template minimal --no-install --no-git
cd my-docs
pnpm add @lancher-dev/jaad
```

```bash yarn
yarn create astro my-docs --template minimal --no-install --no-git
cd my-docs
yarn add @lancher-dev/jaad
```

:::

> [!NOTE]
> Node.js 22.12 or higher is required, along with Astro 7. JAAD declares Astro as a peer dependency, so it uses the copy already in your project.

## Wire it up

Three files. You only ever open the first.

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

`title` is the only required option. Everything else has a default, and several things are worked out from the repository itself. See [Configuration](/docs/configurations/reference).

The other two are boilerplate: `astro.config.mjs` hands over to JAAD, `src/content.config.ts` tells Astro where the markdown lives. Neither needs to change again.

> [!IMPORTANT]
> Set `site`. Without it Astro cannot build absolute URLs, so canonical links and social card images are left out.

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

```ts
defineJaadConfig({ title: "My Project", docsDir: "./documentation" });
```

The documentation is mounted at `/docs`. To open it at the site root instead, see [opening the docs at the site root](/docs/configurations/reference#opening-the-docs-at-the-site-root).

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
