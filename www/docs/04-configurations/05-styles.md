# Styles

Colours, fonts and surfaces are CSS custom properties. You change them by creating one file.

## src/jaad.css

If `src/jaad.css` exists in your project, JAAD loads it **after** its own stylesheet, so anything you put there wins. There is no option to set. The file is the convention.

```css
/* src/jaad.css */
:root {
  --color-primary: #3b5bdb;
  --color-background: #ffffff;
}

html.dark {
  --color-primary: #748ffc;
  --color-background: #0d1117;
}
```

No build step, no option. It applies to both the site chrome and the rendered markdown.

## The tokens that matter

Six will get you most of the way:

| Token                | What it colours                          |
| -------------------- | ---------------------------------------- |
| `--color-background` | Page background                          |
| `--color-foreground` | Body text                                |
| `--color-primary`    | Links, accents, active states            |
| `--color-surface`    | Cards, the search palette, raised panels |
| `--color-border`     | Separators and outlines                  |
| `--font-sans`        | Interface and body text                  |

## The full set

**Backgrounds**: `--color-background`, `--color-background-secondary`, `--color-background-tertiary`, `--color-surface`, `--color-surface-hover`

**Text**: `--color-foreground`, `--color-foreground-secondary`, `--color-foreground-muted`, `--color-foreground-bright`

**Accent**: `--color-primary`, `--color-primary-dark`, `--color-primary-light`

**Borders**: `--color-border`, `--color-border-light`, `--color-border-dark`

**Status**: `--color-error`, `--color-warning`, `--color-info`, `--color-success`

**Fonts**: `--font-sans`, `--font-serif`, `--font-mono`

## Layout

Widths are tokens too, so the same file moves them:

```css
/* src/jaad.css */
:root {
  --jaad-content-width: 64rem;
  --jaad-sidebar-width: 18rem;
}
```

| Token                  | Default           |
| ---------------------- | ----------------- |
| `--jaad-content-width` | `56rem`           |
| `--jaad-chrome-width`  | the content width |
| `--jaad-sidebar-width` | `16rem`           |
| `--jaad-page-padding`  | `2rem`            |

Header, footer and the documentation column share one measure, and the sidebars are
positioned from it, so changing the content width moves everything together. See
[Custom pages](/docs/configurations/custom-pages) for building your own pages on top.

## Markdown content

The rendered markdown is styled by [JAAMD](https://github.com/lancher-dev/jaamd), which has its own tokens under the `--jaamd-` prefix. They derive from a handful of seeds, so you rarely touch more than these:

```css
:root {
  --jaamd-bg: #ffffff;
  --jaamd-color-fg: #3a3a3a;
  --jaamd-color-fg-bright: #1a1a1a;
  --jaamd-color-primary: #3b5bdb;
}
```

Code block surfaces, table borders, blockquote fills and alert backgrounds are all computed from those with `color-mix()`. Change a seed and the whole set follows, staying consistent.

Individual tokens can still be overridden by name when you want an exception. See [Themes](/docs/configurations/themes).

> [!NOTE]
> The derived tokens use `color-mix()`, supported in Chrome and Edge 111+, Safari 16.2+ and Firefox 113+. On older browsers those colours do not apply.
