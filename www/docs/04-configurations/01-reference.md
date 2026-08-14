# Configuration

Everything lives in `jaad.config.ts`. Only `title` is required.

```ts
import { defineJaadConfig } from "@lancher-dev/jaad";

export default defineJaadConfig({
  site: "https://example.dev",
  title: "My Project",
});
```

## Site

| Option | Type     | Default | Notes                                                             |
| ------ | -------- | ------- | ----------------------------------------------------------------- |
| `site` | `string` | none    | Public URL. Needed for canonical links, sitemap and social cards. |
| `base` | `string` | none    | Subpath, when the site is not served from a domain root.          |

Both are handed to Astro for you.

## Identity

| Option        | Type     | Default        | Notes                                                                                       |
| ------------- | -------- | -------------- | ------------------------------------------------------------------------------------------- |
| `title`       | `string` | none           | **Required.** Site name, browser tab, social cards.                                         |
| `description` | `string` | `package.json` | Falls back to your `package.json` description.                                              |
| `lang`        | `string` | `"en"`         | Sets `<html lang>` and `og:locale`.                                                         |
| `logo`        | `string` | none           | Public URL such as `/logo.svg`, shown instead of the title. A source path is a build error. |

## Content

| Option      | Type     | Default    | Notes                                                                                                                             |
| ----------- | -------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `docsDir`   | `string` | `"./docs"` | Folder to read markdown from.                                                                                                     |
| `routeBase` | `string` | `"/docs"`  | Where the documentation is mounted. Use `"/"` for a docs-only site. Slashes are normalised, so `"docs"` and `"/docs/"` both work. |

## Links

`nav` are text links; `social` are icons.

```ts
defineJaadConfig({
  title: "My Project",
  nav: [{ label: "API", href: "https://api.example.dev" }],
  social: {
    // A bundled git forge only needs its URL.
    github: "https://github.com/me/repo",

    // Anything else brings its own icon.
    forum: {
      href: "https://forum.example.dev",
      label: "Forum",
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="…" /></svg>`,
    },
  },
});
```

Bundled forges: `github`, `gitlab`, `codeberg`, `gitea`, `forgejo`, `bitbucket`, `sourcehut`. These are the forges the repository link can be inferred from. Any other key works as long as you pass an `svg`.

**You usually do not need `social` at all.** If the project has a git remote, the repository link and its icon are worked out from it.

## Footer

```ts
defineJaadConfig({ title: "…", footer: "© 2026 Me" });

defineJaadConfig({
  title: "…",
  footer: { message: "MIT Licensed", copyright: "© 2026 Me" },
});
```

A "Built with JAAD" credit is always present; `footer` adds to it.

## Repository

| Option     | Type                | Default | Notes                                                                           |
| ---------- | ------------------- | ------- | ------------------------------------------------------------------------------- |
| `editLink` | `boolean \| string` | `true`  | `true` derives it from the git remote. Pass a URL to override, `false` to hide. |

With `editLink: true` the base URL comes from `git remote get-url origin`, the current branch, and `docsDir` resolved from the **repository** root, so a site living in a subdirectory still links correctly. When there is no repository, no remote, or the remote cannot be parsed, the link is simply omitted rather than pointing somewhere wrong.

To override, pass a URL. `:path` is replaced with the file, or appended if absent:

```ts
defineJaadConfig({
  title: "…",
  editLink: "https://git.example.dev/me/repo/edit/main/docs/:path",
});
```

## SEO

| Option    | Type              | Default           | Notes                                         |
| --------- | ----------------- | ----------------- | --------------------------------------------- |
| `head`    | `HeadTag[]`       | `[]`              | Extra tags in `<head>`.                       |
| `ogImage` | `string \| false` | `"/og-image.png"` | Resolved against `site` into an absolute URL. |

For analytics, verification tags and preconnects.

```ts
defineJaadConfig({
  title: "…",
  head: [
    { tag: "meta", attrs: { name: "google-site-verification", content: "…" } },
    {
      tag: "script",
      attrs: { src: "https://analytics.example.dev/s.js", defer: true },
    },
  ],
});
```

## Theme

| Option  | Type                                        | Default     |
| ------- | ------------------------------------------- | ----------- |
| `theme` | `string \| { light: string; dark: string }` | `"default"` |

A name sets the chrome, the markdown and the code colours together:

```ts
defineJaadConfig({ title: "My Project", theme: "dracula" });
```

Bundled: `default`, `catppuccin`, `gruvbox`, `rose-pine`, `rose-pine-moon`, `dracula`, `nord`,
`one-dark`, `tokyo-night`. An unknown name stops the build and lists the ones that exist.

An object is a [Shiki](https://shiki.style/themes) pair instead, leaving the colours to the
CSS tokens:

```ts
defineJaadConfig({
  title: "…",
  theme: { light: "github-light", dark: "github-dark" },
});
```

See [Themes](/docs/configurations/themes) for writing your own.

## Worked out for you

These have no option because they are read from the project:

| What                         | Where it comes from                    |
| ---------------------------- | -------------------------------------- |
| Repository link and icon     | `git remote get-url origin`            |
| "Edit this page" base URL    | git remote, branch, and `docsDir`      |
| Missing `description`        | `package.json`                         |
| Favicon                      | `public/favicon.svg`, `.ico` or `.png` |
| Custom styles                | `src/jaad.css`, if present             |
| Sitemap                      | Generated when `site` is set           |
| `llms.txt`, raw `.md` routes | Always on                              |

## Extending Astro

Most projects never need this. When you do, `astro` takes any Astro option and is merged into
the generated config. Integrations you add are appended to JAAD's, not replacing them.

```ts
defineJaadConfig({
  title: "My Project",
  astro: {
    build: { format: "file" },
    integrations: [mdx()],
  },
});
```

For full control, replace `astro.config.mjs` with your own. The one-line version is only a
re-export, and `jaad()` is still exported as an ordinary Astro integration:

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import jaad from "@lancher-dev/jaad";
import config from "./jaad.config";

export default defineConfig({
  site: config.site,
  integrations: [jaad(config)],
});
```
