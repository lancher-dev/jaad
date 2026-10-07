# Upgrading

Changes that need action, by the version you upgrade from.

## From 0.9

### Tailwind on your own pages

0.9 left Tailwind to the site: plugin in `astro.vite.plugins` and a stylesheet
importing `tailwindcss`. Replace both with the option:

```ts
// jaad.config.ts
defineJaadConfig({ title: "My Project", tailwind: true });
```

- Remove `@tailwindcss/vite` from `astro.vite.plugins`. If it stays, JAAD
  leaves it and skips its own.
- Remove CSS that imports `tailwindcss` for pages using `Page`: it adds a second
  preflight and Tailwind's default fonts over JAAD's. Utilities now read JAAD's
  tokens directly (`bg-surface`, `text-primary`), with no `@theme` to write.
- Pages on a local layout keep their own `@import "tailwindcss";`.
- `tailwindcss` and `@tailwindcss/vite` stay in your devDependencies.

See [Styles](/docs/configurations/styles#tailwind).

### Component classes

JAAD's markup no longer uses Tailwind utilities: every element has a
`jaad-*` or `docs-*` class, styled in `@layer components`. CSS that targeted
utilities in JAAD's markup needs the new names:

| Before                           | Now                                   |
| -------------------------------- | ------------------------------------- |
| `body` utilities                 | `.jaad-body`                          |
| default frame wrapper `contents` | `.docs-frame`                         |
| `.theme-icon-to-dark` / `-light` | `.jaad-theme-icon-to-dark` / `-light` |
| active ToC link class            | `[aria-current="location"]`           |

`dist/jaad.css` no longer contains stray utilities (`.hidden`, `.block`,
`.relative`, …). Pages that used them without Tailwind need `tailwind: true` or
their own CSS.

## From 0.8

JAAD ships a precompiled stylesheet and no longer depends on Tailwind. Until
0.8 its Tailwind plugin also generated the utilities used in your own pages;
from 0.9 those classes are missing unless the site provides Tailwind. Use
`tailwind: true` (see [From 0.9](#from-09)).

## From 0.7

`@lancher-dev/jaad/layouts/Base.astro` is gone. It forwarded every prop to the
page layout: change the import to `@lancher-dev/jaad/layouts/Page.astro`.
