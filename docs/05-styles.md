# Styles

JAAD ships with a complete set of design tokens that control every visual aspect of the documentation layout and markdown rendering. All of these tokens are plain CSS custom properties — no build step, no config file, no plugin required to change them.

## How it works

The default values live in `src/styles/jaad/defaults.css` and are loaded automatically as part of `src/styles/jaad/styles.css`. Every token is defined on `:root`, which means they cascade globally and can be overridden from any stylesheet that loads after the defaults.

The intended place for project-level overrides is `src/styles/global.css`, right after the `@import "tailwindcss"` line. That placement matters: Tailwind's `@theme` block runs first and exposes its generated `--color-*` and `--font-*` tokens, so your overrides can reference them freely.

```css
/* src/styles/global.css */

@import "tailwindcss";

@theme {
  --color-primary: #1d4ed8; /* your brand blue */
}

/* JAAD overrides — can use any Tailwind token from @theme above */
:root {
  --jaad-font-mono: "JetBrains Mono", monospace;
  --jaad-font-size: 1rem;
  --jaad-alert-note-color: var(--color-primary);
  --jaad-alert-note-bg: #eff6ff;
}
```

## Typography

Four tokens govern the type system inside markdown content.

`--jaad-font-sans` and `--jaad-font-serif` default to the project's Inter and Merriweather stacks respectively. `--jaad-font-mono` defaults to Fira Code and is used for both inline code spans and code blocks. `--jaad-font-size` is the base `rem` value from which every other font size in the markdown is derived (f.e. headings, table cells, copy buttons) so changing this one token scales the entire content area proportionally.

```css
:root {
  --jaad-font-sans: "Source Sans 3", sans-serif;
  --jaad-font-serif: "Lora", serif;
  --jaad-font-mono: "Cascadia Code", monospace;
  --jaad-font-size: 1rem; /* default: 1.125rem */
}
```

## Inline code

Inline code spans use three tokens: `--jaad-code-bg` for the background fill, `--jaad-code-border` for the one-pixel border, and `--jaad-code-fg` for the text colour. All three default to warm neutral tones that sit comfortably on JAAD's paper-like background.

```css
:root {
  --jaad-code-bg: var(--color-background-secondary);
  --jaad-code-border: var(--color-border);
  --jaad-code-fg: var(--color-foreground-bright);
}
```

## Code blocks

Fenced code blocks rendered by Shiki are styled through `--jaad-pre-bg`, `--jaad-pre-border`, and `--jaad-pre-fg`. The copy button that appears in the top-right corner of each block has its own set of six tokens: background, border, and text colour for both the resting and hover states.

```css
:root {
  /* block itself */
  --jaad-pre-bg: var(--color-background-tertiary);
  --jaad-pre-border: var(--color-border-dark);
  --jaad-pre-fg: var(--color-primary);

  /* copy button */
  --jaad-copy-btn-bg: var(--color-border);
  --jaad-copy-btn-border: #a8a39e;
  --jaad-copy-btn-fg: var(--color-primary);
  --jaad-copy-btn-hover-bg: var(--color-border-dark);
  --jaad-copy-btn-hover-border: #9a958f;
  --jaad-copy-btn-hover-fg: var(--color-foreground-bright);
}
```

## Blockquotes and emphasis

The left border colour of a blockquote is set by `--jaad-blockquote-border` and the italic text inside it by `--jaad-blockquote-fg`. The same border token is reused as the fallback colour for the default (unstyled) alert variant. Italic text (`*em*`) across the rest of the page draws its colour from `--jaad-em-fg`.

## Tables

`--jaad-table-border` controls all table borders — the outer shadow ring, column dividers, and row separators — through a single token. `--jaad-table-hover-bg` sets the background colour that appears when hovering a row.

## Code tabs

The `:::code-tabs` extension uses four tokens. `--jaad-tabs-border` is shared between the outer container border and the header divider. `--jaad-tabs-header-bg` fills the tab strip, `--jaad-tabs-btn-hover-bg` tints an inactive tab on hover, and `--jaad-tabs-btn-active-bg` sets the selected tab's background (it also bleeds into the tab strip as the border-bottom color to produce a seamless join).

## Details / Summary

The collapsible `<details>` block uses `--jaad-details-border` for its outer border.

## Alerts

Each of the five GitHub-style alert variants (`NOTE`, `TIP`, `IMPORTANT`, `WARNING`, and `CAUTION`) exposes two tokens: `--jaad-alert-{variant}-color` for the left border and title, and `--jaad-alert-{variant}-bg` for the background fill. Changing just the colour token is often enough to adapt alerts to a different brand palette.

```css
:root {
  --jaad-alert-note-color: var(--color-info); /* default: #0969da */
  --jaad-alert-note-bg: #e8f0fd;

  --jaad-alert-tip-color: var(--color-success); /* default: #1a7f37 */
  --jaad-alert-tip-bg: #e6f4ea;

  --jaad-alert-warning-color: var(--color-warning); /* default: #9a6700 */
  --jaad-alert-warning-bg: #fffbeb;

  --jaad-alert-caution-color: var(--color-error); /* default: #cf222e */
  --jaad-alert-caution-bg: #fef2f2;

  --jaad-alert-important-color: #7c3aed; /* default: #8250df */
  --jaad-alert-important-bg: #f5f3ff;
}
```
