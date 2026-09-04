# Configuration

Everything lives in `jaad.config.ts`. Only `title` is required.

These options configure the documentation experience. Ordinary Astro pages
outside `docs/` keep their own layout and styles.

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

| Option      | Type     | Default    | Notes                                                                                             |
| ----------- | -------- | ---------- | ------------------------------------------------------------------------------------------------- |
| `docsDir`   | `string` | `"./docs"` | Folder to read markdown from.                                                                     |
| `routeBase` | `string` | `"/"`      | Where the documentation is mounted. Slashes are normalised, so `"docs"` and `"/docs/"` both work. |

### Adding a landing page

By default the documentation owns the site root, and the first sorted page is
rendered at `/`. No `src/pages/index.astro` is needed.

To give `/` to a landing page, mount the documentation below it:

```ts
defineJaadConfig({ title: "My Project", routeBase: "/docs" });
```

Then create an ordinary `src/pages/index.astro`. Leaving an index page in place
while the docs are mounted at `/` produces a route conflict, and JAAD warns with
the configuration to use.

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

Naming a forge yourself turns that inference off, so the header shows the repository you chose and not the one the remote happens to point at. This is what a documentation site kept in its own repository needs.

## Footer

| Option   | Type              | Default   | Notes                                                         |
| -------- | ----------------- | --------- | ------------------------------------------------------------- |
| `footer` | `string \| false` | `:credit` | One line of text. Inline HTML is allowed. `false` removes it. |

The footer is one line, and the words in it are yours. Leave it unset and you get the
"Built with JAAD" credit; write your own and that is what appears instead:

```ts
defineJaadConfig({ title: "…", footer: "© 2026 Me" });

defineJaadConfig({
  title: "…",
  footer: 'MIT Licensed · © 2026 Me · <a href="/imprint">Imprint</a>',
});
```

`:credit` stands in for the credit line, wherever you want it, so keeping it does not mean
pasting our URL into your config:

```ts
defineJaadConfig({ title: "…", footer: "© 2026 Me · :credit" });
```

`footer: false` removes the footer altogether.

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

| Option    | Type              | Default          | Notes                                         |
| --------- | ----------------- | ---------------- | --------------------------------------------- |
| `head`    | `HeadTag[]`       | `[]`             | Extra tags in `<head>`.                       |
| `ogImage` | `string \| false` | detected or none | Resolved against `site` into an absolute URL. |

JAAD looks in `public/` for `og-image.png`, `.jpg`, `.jpeg` or `.webp`, in that
order. If none exists, image metadata is omitted rather than pointing at a
missing asset. Pass a public path or absolute URL to override the detected
image, or `false` to disable it explicitly:

```ts
defineJaadConfig({ title: "…", ogImage: "/social-card.png" });
```

Canonical URLs and local social images are emitted only when `site` is set.
An absolute external `ogImage` can be emitted without `site` because it already
has a public origin.

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

| Option       | Type                                        | Default     |
| ------------ | ------------------------------------------- | ----------- |
| `theme`      | `string \| { light: string; dark: string }` | `"default"` |
| `appearance` | `"auto" \| "light" \| "dark"`               | `"auto"`    |

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

`appearance` decides whether the reader gets a say. `"auto"` follows their system preference
and shows the switcher; `"light"` or `"dark"` pins the site and removes it.

```ts
defineJaadConfig({ title: "…", theme: "tokyo-night", appearance: "dark" });
```

See [Themes](/docs/configurations/themes) for writing your own.

## Worked out for you

These have no option because they are read from the project:

| What                         | Where it comes from                               |
| ---------------------------- | ------------------------------------------------- |
| Repository link and icon     | `git remote get-url origin`                       |
| "Edit this page" base URL    | git remote, branch, and `docsDir`                 |
| Missing `description`        | `package.json`                                    |
| Favicon                      | `public/favicon.svg`, `.ico` or `.png`            |
| Social card image            | `public/og-image.png`, `.jpg`, `.jpeg` or `.webp` |
| Custom styles                | `src/jaad.css`, if present                        |
| Sitemap                      | Generated when `site` is set                      |
| `llms.txt`, raw `.md` routes | Always on                                         |

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
