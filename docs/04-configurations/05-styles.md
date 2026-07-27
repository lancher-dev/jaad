# Styles

JAAD ships with a complete set of design tokens that control every visual aspect of the documentation layout and markdown rendering. All of these tokens are plain CSS custom properties — no build step, no config file, no plugin required to change them.

## How it works

Markdown styling is provided by **[JAAMD](https://github.com/lancher-dev/jaamd)**. All tokens are CSS custom properties scoped under `:root`, with warm neutral defaults.

JAAMD wraps its defaults in `@layer jaamd.defaults`. Because unlayered CSS always beats layered CSS in the cascade, **any `:root` block you write outside a layer wins automatically — regardless of import order**. You never have to think about where your stylesheet sits relative to JAAMD's.

In JAAD the markdown tokens are overridden in `src/styles/jaamd.css`, which is where you should put your changes. (Layout tokens — the `--color-*` family — live in `src/styles/global.css`.)

```css
/* src/styles/global.css — layout tokens */

@import "tailwindcss";

@theme {
  --color-primary: #1d4ed8; /* your brand blue */
}
```

```css
/* src/styles/jaamd.css — markdown tokens */

:root {
  --jaamd-font-mono: "JetBrains Mono", monospace;
  --jaamd-font-size: 1rem;
  --jaamd-alert-note-color: var(--color-primary);
  --jaamd-alert-note-bg: #eff6ff;
}
```

Tailwind's `@theme` block exposes its `--color-*` and `--font-*` tokens globally, so your markdown overrides can reference them freely as shown above.

## Core colors

Four tokens set the base text and accent colours that most other elements inherit from. They are the ones to change first when adapting JAAMD to a palette.

`--jaamd-color-fg` is the default body text colour. `--jaamd-color-fg-bright` is used wherever text should stand out against it — headings, `**bold**`, table headers, and `<summary>` labels. `--jaamd-color-primary` is the accent applied to links, the active code tab, and the `<details>` arrow; `--jaamd-color-primary-light` is its hover/secondary variant, also used for blockquote text.

```css
:root {
  --jaamd-color-fg: var(--color-foreground);
  --jaamd-color-fg-bright: var(--color-foreground-bright);
  --jaamd-color-primary: var(--color-primary);
  --jaamd-color-primary-light: var(--color-primary-light);
}
```

A fifth token, `--jaamd-color-success`, sets the colour the copy button flashes after a successful copy.

## Typography

Four tokens govern the type system inside markdown content.

`--jaamd-font-sans` defaults to the project's configured sans-serif stack. `--jaamd-font-mono` is used for both inline code spans and code blocks. `--jaamd-font-size` is the base value from which every other font size in the markdown is derived (headings, table cells, copy buttons, tab labels) so changing this one token scales the entire content area proportionally. `--jaamd-line-height` controls the default vertical rhythm and is applied to the content wrapper, `<pre>` blocks, and list items.

```css
:root {
  --jaamd-font-sans: "Source Sans 3", sans-serif;
  --jaamd-font-mono: "Cascadia Code", monospace;
  --jaamd-font-size: 1rem;
  --jaamd-line-height: 1.5;
}
```

## Headings

`--jaamd-heading-border-color` controls the bottom border drawn under every `h2`.

```css
:root {
  --jaamd-heading-border-color: var(--color-border);
}
```

## Inline code

Inline code spans use three tokens: `--jaamd-code-bg` for the background fill, `--jaamd-code-border` for the one-pixel border, and `--jaamd-code-fg` for the text colour.

```css
:root {
  --jaamd-code-bg: var(--color-background-secondary);
  --jaamd-code-border: var(--color-border);
  --jaamd-code-fg: var(--color-foreground-bright);
}
```

## Code blocks

Fenced code blocks rendered by Shiki are styled through `--jaamd-pre-bg`, `--jaamd-pre-border`, and `--jaamd-pre-fg`. The copy button that appears in the top-right corner of each block has its own set of six tokens: background, border, and text colour for both the resting and hover states.

```css
:root {
  /* block itself */
  --jaamd-pre-bg: var(--color-background-tertiary);
  --jaamd-pre-border: var(--color-border-dark);
  --jaamd-pre-fg: var(--color-primary);

  /* copy button */
  --jaamd-copy-btn-bg: var(--color-border);
  --jaamd-copy-btn-border: #a8a39e;
  --jaamd-copy-btn-fg: var(--color-primary);
  --jaamd-copy-btn-hover-bg: var(--color-border-dark);
  --jaamd-copy-btn-hover-border: #9a958f;
  --jaamd-copy-btn-hover-fg: var(--color-foreground-bright);
}
```

## Blockquotes and emphasis

The left border colour of a blockquote is set by `--jaamd-blockquote-border`, the background by `--jaamd-blockquote-bg`, and the italic text inside it by `--jaamd-blockquote-fg`. The same border and background tokens are reused for the default (unstyled) alert variant. Italic text (`*em*`) across the rest of the page draws its colour from `--jaamd-em-fg`.

## Horizontal rule

`--jaamd-hr-color` sets the colour of `---` dividers.

## Tables

`--jaamd-table-border` controls all table borders — the outer shadow ring, column dividers, and row separators — through a single token. `--jaamd-table-header-bg` fills the `<th>` cells, and `--jaamd-table-hover-bg` sets the background that appears when hovering a row.

## Code tabs

The `:::code-tabs` extension uses four tokens. `--jaamd-tabs-border` is shared between the outer container border and the header divider. `--jaamd-tabs-header-bg` fills the tab strip, `--jaamd-tabs-btn-hover-bg` tints an inactive tab on hover, and `--jaamd-tabs-btn-active-bg` sets the selected tab's background (it also bleeds into the tab strip as the `border-bottom-color` to produce a seamless join).

## Details / Summary

The collapsible `<details>` block uses `--jaamd-details-bg` for its background and `--jaamd-details-border` for its outer border.

## Spoiler

The spoiler component hides text by matching the text colour to the background. `--jaamd-spoiler-hidden-color` is used for both `color` and `background-color` in the hidden state, making the text invisible. On hover or after clicking, the element switches to `--jaamd-spoiler-revealed-bg` and `--jaamd-spoiler-revealed-fg`.

```css
:root {
  --jaamd-spoiler-hidden-color: #1a1a1a; /* same as background = invisible */
  --jaamd-spoiler-revealed-bg: var(--color-background-secondary);
  --jaamd-spoiler-revealed-fg: var(--color-foreground);
}
```

## Alerts

Each of the five GitHub-style alert variants (`NOTE`, `TIP`, `IMPORTANT`, `WARNING`, and `CAUTION`) exposes two tokens: `--jaamd-alert-{variant}-color` for the left border and title, and `--jaamd-alert-{variant}-bg` for the background fill. Changing just the colour token is often enough to adapt alerts to a different brand palette.

```css
:root {
  --jaamd-alert-note-color: var(--color-info); /* default: #0969da */
  --jaamd-alert-note-bg: #e8f0fd;

  --jaamd-alert-tip-color: var(--color-success); /* default: #1a7f37 */
  --jaamd-alert-tip-bg: #e6f4ea;

  --jaamd-alert-warning-color: var(--color-warning); /* default: #9a6700 */
  --jaamd-alert-warning-bg: #fffbeb;

  --jaamd-alert-caution-color: var(--color-error); /* default: #cf222e */
  --jaamd-alert-caution-bg: #fef2f2;

  --jaamd-alert-important-color: #7c3aed; /* default: #8250df */
  --jaamd-alert-important-bg: #f5f3ff;
}
```
