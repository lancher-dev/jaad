# Installation

JAAD is an [Astro](https://astro.build) integration. You add it to a project, point it at a folder of markdown, and get a documentation site.

## The short way

```bash
npm create @lancher-dev/jaad@latest
```

The CLI asks for the destination, template, title and whether to install. Choose
`docs` for a documentation-only site at `/`, or `site` for a landing page at
`/` with documentation at `/docs`.

Flags pre-fill those answers, so a complete non-interactive invocation looks
like this:

```bash
npm create @lancher-dev/jaad@latest my-docs -- --template docs --title "My Docs" --install
```

For a site with a landing page:

```bash
npm create @lancher-dev/jaad@latest my-site -- --template site --title "My Site" --install
```

If the repository already exists, use `--here` instead of a destination:

```bash
npm create @lancher-dev/jaad@latest -- --here --template site
```

It adds JAAD to the project you already have, keeps your `package.json` as it is, and leaves your existing markdown alone.

> [!NOTE]
> In CI and other non-interactive environments every answer is required: a
> destination or `--here`, `--template`, `--title`, and either `--install` or
> `--no-install`.

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
> Set `site`. Without it JAAD omits canonical URLs and local social card images
> instead of emitting build-time URLs that are not publicly valid.

## Write something

Create a `docs/` folder in the project root and put a markdown file in it.

```
docs/
  01-introduction.md   → /
  02-guide.md          → /guide
  03-advanced/         → chapter "Advanced"
    01-config.md       → /advanced/config
```

Numbers set the order and are stripped from the URL. Folders become chapters. The first `# Heading` in each file becomes the page title. No frontmatter is required, and there is no sidebar to configure.

If your markdown already lives somewhere else, point `docsDir` at it instead of moving it:

```ts
defineJaadConfig({ title: "My Project", docsDir: "./documentation" });
```

With the `docs` template, the first page in the sorted file structure opens at
`/`; its named URL redirects there. The `site` template generates a minimal
landing page with its own local Astro layout and sets `routeBase: "/docs"` for
you. The landing page does not depend on the documentation layout or theme.

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

The site starts at `http://localhost:4321`, with the documentation at `/`. Saving a markdown file reloads the browser.
