# Configuration

Every option passed to `jaad()` in `astro.config.mjs`. Only `title` is required.

```js
import jaad from "jaad";

export default defineConfig({
  site: "https://example.dev",
  integrations: [
    jaad({
      title: "My Project",
    }),
  ],
});
```

## Identity

| Option        | Type     | Default        | Notes                                               |
| ------------- | -------- | -------------- | --------------------------------------------------- |
| `title`       | `string` | none           | **Required.** Site name, browser tab, social cards. |
| `description` | `string` | `package.json` | Falls back to your `package.json` description.      |
| `lang`        | `string` | `"en"`         | Sets `<html lang>` and `og:locale`.                 |
| `logo`        | `string` | none           | Image path shown instead of the title text.         |

## Content

| Option      | Type     | Default    | Notes                                                               |
| ----------- | -------- | ---------- | ------------------------------------------------------------------- |
| `docsDir`   | `string` | `"./docs"` | Folder to read markdown from.                                       |
| `routeBase` | `string` | `"/docs"`  | Where the documentation is mounted. Use `"/"` for a docs-only site. |

## Links

`nav` are text links; `social` are icons.

```js
jaad({
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

Bundled forges: `github`, `gitlab`, `codeberg`, `gitea`, `forgejo`, `bitbucket`, `sourcehut`. They are bundled because they are what the repository link can be inferred from. JAAD is not trying to be an icon library. Any other key works as long as you pass an `svg`.

**You usually do not need `social` at all.** If the project has a git remote, the repository link and its icon are worked out from it.

## Footer

```js
jaad({ title: "…", footer: "© 2026 Me" });
jaad({
  title: "…",
  footer: { message: "MIT Licensed", copyright: "© 2026 Me" },
});
```

A "Built with JAAD" credit is always present; `footer` adds to it.

## Repository

| Option        | Type                | Default | Notes                                                                           |
| ------------- | ------------------- | ------- | ------------------------------------------------------------------------------- |
| `editLink`    | `boolean \| string` | `true`  | `true` derives it from the git remote. Pass a URL to override, `false` to hide. |
| `lastUpdated` | `boolean`           | `true`  | Reserved; not yet implemented.                                                  |

With `editLink: true` the base URL comes from `git remote get-url origin`, the current branch, and `docsDir` resolved from the **repository** root, so a site living in a subdirectory still links correctly. When there is no repository, no remote, or the remote cannot be parsed, the link is simply omitted rather than pointing somewhere wrong.

To override, pass a URL. `:path` is replaced with the file, or appended if absent:

```js
jaad({
  title: "…",
  editLink: "https://git.example.dev/me/repo/edit/main/docs/:path",
});
```

## SEO

| Option    | Type              | Default           | Notes                                         |
| --------- | ----------------- | ----------------- | --------------------------------------------- |
| `head`    | `HeadTag[]`       | `[]`              | Extra tags in `<head>`.                       |
| `ogImage` | `string \| false` | `"/og-image.png"` | Resolved against `site` into an absolute URL. |

`head` is the escape hatch for analytics, verification tags and preconnects, and it is data rather than a component, so it does not break when JAAD changes.

```js
jaad({
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

| Option  | Type                                        | Default                                          |
| ------- | ------------------------------------------- | ------------------------------------------------ |
| `theme` | `string \| { light: string; dark: string }` | `{ light: "github-light", dark: "github-dark" }` |

A pair of [Shiki themes](https://shiki.style/themes) for code blocks, passed through to JAAMD. Colours and fonts are changed with CSS tokens instead. See [Styles](/docs/configurations/styles).

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

## Keeping options in their own file

If the people editing the documentation are not the people maintaining the build, a separate file keeps them out of `astro.config.mjs`:

```ts
// jaad.config.ts
import { defineJaadConfig } from "jaad";

export default defineJaadConfig({
  title: "My Project",
});
```

```js
// astro.config.mjs
import jaadConfig from "./jaad.config";

export default defineConfig({
  integrations: [jaad(jaadConfig)],
});
```
