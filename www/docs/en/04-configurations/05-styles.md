# Styles

Create `src/jaad.css` to override JAAD's CSS custom properties. It loads after
the bundled stylesheet, on documentation pages and on pages using `Page`.

```css
:root {
  --color-primary: #3b5bdb;
  --color-background: #ffffff;
}

html.dark {
  --color-primary: #748ffc;
  --color-background: #0d1117;
}
```

JAAD ships its stylesheet compiled and adds nothing to your project. Use any
CSS for pages of your own.

## Tailwind

:::code-tabs

```bash npm
npm i -D tailwindcss @tailwindcss/vite
```

```bash pnpm
pnpm add -D tailwindcss @tailwindcss/vite
```

```bash yarn
yarn add -D tailwindcss @tailwindcss/vite
```

```bash bun
bun add -d tailwindcss @tailwindcss/vite
```

:::

```ts
// jaad.config.ts
defineJaadConfig({ title: "My Project", tailwind: true });
```

JAAD registers the plugin, unless `astro.vite.plugins` already has it.

- Applies to documentation pages, pages using `Page` and a custom `DocsFrame`.
- Colours and fonts follow JAAD's tokens: `bg-surface`, `border-border-light`,
  `font-mono`.
- `dark:` follows JAAD's theme switch.
- Layout tokens via arbitrary values: `max-w-(--jaad-chrome-width)`.
- Pages on a local layout get plain Tailwind (no JAAD tokens) by adding
  `@import "tailwindcss";` to their CSS.

## Core tokens

| Token                | Purpose                          |
| -------------------- | -------------------------------- |
| `--color-background` | Page background                  |
| `--color-foreground` | Body text                        |
| `--color-primary`    | Links, accents and active states |
| `--color-surface`    | Raised surfaces                  |
| `--color-border`     | Separators and outlines          |
| `--font-sans`        | Interface and body text          |

The complete groups are:

- Backgrounds: `--color-background`, `--color-background-secondary`,
  `--color-background-tertiary`, `--color-surface`, `--color-surface-hover`.
- Text: `--color-foreground`, `--color-foreground-secondary`,
  `--color-foreground-muted`, `--color-foreground-bright`.
- Accent: `--color-primary`, `--color-primary-dark`, `--color-primary-light`.
- Borders: `--color-border`, `--color-border-light`, `--color-border-dark`.
- Status: `--color-error`, `--color-warning`, `--color-info`, `--color-success`.
- Fonts: `--font-sans`, `--font-serif`, `--font-mono`.

## Layout tokens

| Token                  | Default           |
| ---------------------- | ----------------- |
| `--jaad-content-width` | `56rem`           |
| `--jaad-chrome-width`  | the content width |
| `--jaad-sidebar-width` | `16rem`           |
| `--jaad-page-padding`  | `2rem`            |

```css
:root {
  --jaad-content-width: 64rem;
  --jaad-sidebar-width: 18rem;
}
```

Use [Advanced layout](/docs/configurations/advanced-layout) when token changes
are not enough.

## Markdown tokens

JAAMD tokens use the `--jaamd-` prefix. Most rendered Markdown can be changed
through four seeds:

```css
:root {
  --jaamd-bg: #ffffff;
  --jaamd-color-fg: #3a3a3a;
  --jaamd-color-fg-bright: #1a1a1a;
  --jaamd-color-primary: #3b5bdb;
}
```

Derived colours use `color-mix()`, supported in Chrome and Edge 111+, Safari
16.2+ and Firefox 113+.
