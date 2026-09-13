# Configuration

All JAAD options live in `jaad.config.ts`. Only `title` is required.

```ts
import { defineJaadConfig } from "@lancher-dev/jaad";

export default defineJaadConfig({
  site: "https://example.dev",
  title: "My Project",
});
```

These options apply only to documentation pages. Pages in `src/pages/` keep
their own layout, styles and metadata.

## Site

| Option | Type     | Default | Description                                         |
| ------ | -------- | ------- | --------------------------------------------------- |
| `site` | `string` | none    | Public URL used for canonical links and the sitemap |
| `base` | `string` | none    | Subpath when the site is not served from `/`        |

## Identity

| Option        | Type     | Default        | Description                                       |
| ------------- | -------- | -------------- | ------------------------------------------------- |
| `title`       | `string` | none           | **Required.** Site name and metadata              |
| `description` | `string` | `package.json` | Site description                                  |
| `lang`        | `string` | `"en"`         | Site language, and the default when localised     |
| `logo`        | `string` | none           | Public path or URL shown instead of the site name |

A source file path passed to `logo` produces a build error. Use a public path
such as `/logo.svg`.

## Content

| Option      | Type                | Default    | Description                              |
| ----------- | ------------------- | ---------- | ---------------------------------------- |
| `docsDir`   | `string`            | `"./docs"` | Directory containing Markdown files      |
| `routeBase` | `string`            | `"/"`      | Route where documentation is mounted     |
| `locales`   | `string[] \| false` | detected   | Override the detected locale directories |
| `ui`        | `object`            | `{}`       | Interface strings, per locale            |

Locale directories under `docsDir` are detected on their own; `locales` only
overrides that. See [Languages](/docs/configurations/i18n).

To keep a landing page at `/`, mount documentation below it:

```ts
defineJaadConfig({ title: "My Project", routeBase: "/docs" });
```

When documentation is mounted at `/`, an existing `src/pages/index.*` creates
a route conflict and JAAD reports the required `routeBase` setting.

## Navigation

| Option   | Type                                | Default  | Description       |
| -------- | ----------------------------------- | -------- | ----------------- |
| `nav`    | `{ label: string; href: string }[]` | `[]`     | Header text links |
| `social` | `Record<string, string \| object>`  | inferred | Header icon links |

For example:

```ts
defineJaadConfig({
  title: "My Project",
  nav: [{ label: "API", href: "https://api.example.dev" }],
  social: {
    github: "https://github.com/me/repo",
    forum: {
      href: "https://forum.example.dev",
      label: "Forum",
      svg: `<svg viewBox="0 0 24 24">...</svg>`,
    },
  },
});
```

Bundled forge icons are available for `github`, `gitlab`, `codeberg`, `gitea`,
`forgejo`, `bitbucket` and `sourcehut`. Other keys require an `svg`.

Object entries accept `href`, with optional `label` and `svg` fields.

When `social` is omitted, JAAD derives the repository link and forge icon from
the git remote. An explicit forge entry overrides that inference.

## Footer

| Option   | Type              | Default   | Description                          |
| -------- | ----------------- | --------- | ------------------------------------ |
| `footer` | `string \| false` | `:credit` | Footer HTML, or `false` to remove it |

Use `:credit` to place the JAAD credit inside custom text:

```ts
defineJaadConfig({ title: "...", footer: "© 2026 Me · :credit" });
```

## Repository

| Option     | Type                | Default | Description                                     |
| ---------- | ------------------- | ------- | ----------------------------------------------- |
| `editLink` | `boolean \| string` | `true`  | Derive, override or hide “Edit this page” links |

Pass a URL to override the inferred repository. `:path` is replaced with the
source file path, or appended when absent:

```ts
defineJaadConfig({
  title: "...",
  editLink: "https://git.example.dev/me/repo/edit/main/docs/:path",
});
```

The link is omitted when the git remote, branch or repository root cannot be
resolved safely.

## SEO and head tags

| Option    | Type              | Default          | Description                       |
| --------- | ----------------- | ---------------- | --------------------------------- |
| `head`    | `object[]`        | `[]`             | Extra elements in `<head>`        |
| `ogImage` | `string \| false` | detected or none | Social image path, URL or `false` |

JAAD detects `public/og-image.png`, `.jpg`, `.jpeg` or `.webp`, in that order.
Local images and canonical URLs require `site`; absolute image URLs do not.

Each `head` entry accepts `tag`, optional `attrs`, and optional `content`. Use
it for analytics, verification tags and preconnects:

```ts
defineJaadConfig({
  title: "...",
  head: [
    { tag: "meta", attrs: { name: "robots", content: "index,follow" } },
    { tag: "script", attrs: { src: "/analytics.js", defer: true } },
  ],
});
```

## Theme and appearance

| Option       | Type                                        | Default     |
| ------------ | ------------------------------------------- | ----------- |
| `theme`      | `string \| { light: string; dark: string }` | `"default"` |
| `appearance` | `"auto" \| "light" \| "dark"`               | `"auto"`    |

A named theme styles the interface, Markdown and code blocks. A `{ light,
dark }` object changes only the Shiki code themes. See
[Themes](/docs/configurations/themes) for available names and custom themes.

`appearance: "auto"` follows the reader's preference and shows the switcher.
`"light"` and `"dark"` pin the appearance and remove it.

## Detected project values

| Value                                     | Source                                            |
| ----------------------------------------- | ------------------------------------------------- |
| Repository and edit links                 | git remote, branch and `docsDir`                  |
| Missing description                       | `package.json`                                    |
| Favicon                                   | `public/favicon.svg`, `.ico` or `.png`            |
| Social image                              | `public/og-image.png`, `.jpg`, `.jpeg` or `.webp` |
| Custom styles                             | `src/jaad.css`                                    |
| Locales                                   | Directory names under `docsDir`                   |
| Sitemap                                   | Generated when `site` is set                      |
| Search index, `llms.txt` and raw Markdown | Generated below `routeBase`                       |

## Extending Astro

| Option  | Type              | Default |
| ------- | ----------------- | ------- |
| `astro` | `AstroUserConfig` | `{}`    |

Pass additional Astro options through `astro`. Extra integrations are appended
to JAAD's integrations:

```ts
defineJaadConfig({
  title: "My Project",
  astro: {
    build: { format: "file" },
    integrations: [mdx()],
  },
});
```

`astro` is read by `@lancher-dev/jaad/site`. `jaad(config)` ignores it.

For full control, use a regular Astro configuration and add `jaad(config)` to
its integrations, as shown in
[Existing Astro project](/docs/getting-started/installation#existing-astro-project).
