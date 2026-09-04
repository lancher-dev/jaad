# Styles

Create `src/jaad.css` to override JAAD's CSS custom properties. It loads after
the bundled stylesheet and applies only to documentation pages.

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
