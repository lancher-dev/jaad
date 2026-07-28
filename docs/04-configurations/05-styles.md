# Styles

JAAD ships with a complete set of design tokens that control every visual aspect of the documentation layout and markdown rendering. All of these tokens are plain CSS custom properties — no build step, no config file, no plugin required to change them.

## How it works

Markdown styling is provided by **[JAAMD](https://github.com/lancher-dev/jaamd)**, which exposes 50 CSS custom properties scoped under `:root`, with warm neutral defaults.

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

## Overriding dark mode

44 of the 50 tokens ship with a dark-mode default, applied when `<html>` carries the `dark` class. To change a value for one mode only, scope it:

```css
:root {
  --jaamd-color-primary: #1d4ed8; /* light */
}

html.dark {
  --jaamd-color-primary: #60a5fa; /* dark */
}
```

The six tokens without a dark variant (the five typography tokens and `--jaamd-color-success`) apply to both modes.

> [!TIP]
> In the tables below, a `–` in the **Dark** column means the token has no separate dark value and the light one is used in both modes.

## Core colors

Four tokens set the base text and accent colours that most other elements inherit from. They are the ones to change first when adapting JAAMD to a palette.

| Token                         | Light     | Dark      | Controls                                         |
| ----------------------------- | --------- | --------- | ------------------------------------------------ |
| `--jaamd-color-fg`            | `#3a3a3a` | `#c9d1d9` | Default body and paragraph text                  |
| `--jaamd-color-fg-bright`     | `#1a1a1a` | `#e6edf3` | Headings, `**bold**`, table headers, `<summary>` |
| `--jaamd-color-primary`       | `#2d2d2d` | `#c9d1d9` | Links, active code tab, `<details>` arrow        |
| `--jaamd-color-primary-light` | `#4a4a4a` | `#8b949e` | Link hover, blockquote text                      |
| `--jaamd-color-success`       | `#22c55e` | –         | Copy button flash after a successful copy        |

```css
:root {
  --jaamd-color-fg: var(--color-foreground);
  --jaamd-color-fg-bright: var(--color-foreground-bright);
  --jaamd-color-primary: var(--color-primary);
  --jaamd-color-primary-light: var(--color-primary-light);
}
```

## Typography

Five tokens govern the type system inside markdown content. `--jaamd-font-size` is the base value from which every other font size is derived (headings, table cells, copy buttons, tab labels), so changing this one token scales the whole content area proportionally.

| Token                 | Default                                                                       | Controls                                                       |
| --------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `--jaamd-font-sans`   | `-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif` | Body text                                                      |
| `--jaamd-font-serif`  | `Georgia, "Times New Roman", Times, serif`                                    | Serif stack, used when the sans stack is overridden to a serif |
| `--jaamd-font-mono`   | `"SF Mono", Consolas, "Liberation Mono", Menlo, Courier, monospace`           | Inline code and code blocks                                    |
| `--jaamd-font-size`   | `1.125rem`                                                                    | Base size all other sizes scale from                           |
| `--jaamd-line-height` | `1.6`                                                                         | Content wrapper, `<pre>` blocks, list items                    |

None of these have a dark-mode variant.

```css
:root {
  --jaamd-font-sans: "Source Sans 3", sans-serif;
  --jaamd-font-mono: "Cascadia Code", monospace;
  --jaamd-font-size: 1rem;
  --jaamd-line-height: 1.5;
}
```

## Headings and rules

Both tokens derive from `--jaamd-color-primary` by default, so changing the accent colour carries through automatically.

| Token                          | Light           | Dark            | Controls                       |
| ------------------------------ | --------------- | --------------- | ------------------------------ |
| `--jaamd-heading-border-color` | `primary / 0.4` | `primary / 0.3` | Bottom border under every `h2` |
| `--jaamd-hr-color`             | `primary / 0.4` | `primary / 0.3` | Colour of `---` dividers       |

## Inline code

| Token                 | Light     | Dark      | Controls         |
| --------------------- | --------- | --------- | ---------------- |
| `--jaamd-code-bg`     | `#e8e4df` | `#161b22` | Background fill  |
| `--jaamd-code-border` | `#d0cbc6` | `#30363d` | One-pixel border |
| `--jaamd-code-fg`     | `#1a1a1a` | `#e6edf3` | Text colour      |

```css
:root {
  --jaamd-code-bg: var(--color-background-secondary);
  --jaamd-code-border: var(--color-border);
  --jaamd-code-fg: var(--color-foreground-bright);
}
```

## Code blocks

Fenced code blocks are rendered by Shiki. The three `pre` tokens style the block itself; note that when a Shiki theme sets its own background, `--jaamd-pre-bg` is overridden by it.

| Token                | Light     | Dark      | Controls             |
| -------------------- | --------- | --------- | -------------------- |
| `--jaamd-pre-bg`     | `#eeeae5` | `#161b22` | Block background     |
| `--jaamd-pre-border` | `#c8c4bf` | `#30363d` | Block border         |
| `--jaamd-pre-fg`     | `#2d2d2d` | `#c9d1d9` | Fallback text colour |

The copy button in the top-right corner of each block has its own six tokens, for the resting and hover states.

| Token                           | Light     | Dark      | Controls           |
| ------------------------------- | --------- | --------- | ------------------ |
| `--jaamd-copy-btn-bg`           | `#d8d4cf` | `#21262d` | Background, idle   |
| `--jaamd-copy-btn-border`       | `#a8a39e` | `#30363d` | Border, idle       |
| `--jaamd-copy-btn-fg`           | `#2d2d2d` | `#c9d1d9` | Icon colour, idle  |
| `--jaamd-copy-btn-hover-bg`     | `#c8c4bf` | `#30363d` | Background, hover  |
| `--jaamd-copy-btn-hover-border` | `#9a958f` | `#484f58` | Border, hover      |
| `--jaamd-copy-btn-hover-fg`     | `#1a1a1a` | `#e6edf3` | Icon colour, hover |

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

The blockquote tokens are reused for the default (unstyled) alert variant.

| Token                       | Light     | Dark      | Controls                           |
| --------------------------- | --------- | --------- | ---------------------------------- |
| `--jaamd-blockquote-bg`     | `#eeeae5` | `#161b22` | Blockquote background              |
| `--jaamd-blockquote-border` | `#5a5a5a` | `#484f58` | Left border accent                 |
| `--jaamd-blockquote-fg`     | `#4a4a4a` | `#8b949e` | Blockquote text                    |
| `--jaamd-em-fg`             | `#4a4a4a` | `#8b949e` | Italic `*em*` text across the page |

## Tables

`--jaamd-table-border` controls every table border through a single token: the outer shadow ring, column dividers and row separators.

| Token                     | Light     | Dark      | Controls                           |
| ------------------------- | --------- | --------- | ---------------------------------- |
| `--jaamd-table-border`    | `#b8b3ae` | `#30363d` | All borders and the outline shadow |
| `--jaamd-table-header-bg` | `#eeeae5` | `#161b22` | `<th>` header row fill             |
| `--jaamd-table-hover-bg`  | `#e0dcd7` | `#1c2128` | Row background on hover            |

## Code tabs

Used by the [`:::code-tabs`](/docs/markdown/code-blocks) block. `--jaamd-tabs-btn-active-bg` also bleeds into the tab strip as its `border-bottom-color`, producing a seamless join between the selected tab and its panel.

| Token                        | Light     | Dark      | Controls                         |
| ---------------------------- | --------- | --------- | -------------------------------- |
| `--jaamd-tabs-border`        | `#c8c4bf` | `#30363d` | Outer border and header divider  |
| `--jaamd-tabs-header-bg`     | `#e0dcd7` | `#1c2128` | Tab strip fill                   |
| `--jaamd-tabs-btn-hover-bg`  | `#d0cbc6` | `#21262d` | Inactive tab on hover            |
| `--jaamd-tabs-btn-active-bg` | `#eeeae5` | `#161b22` | Selected tab, matching its panel |

## Details / Summary

| Token                    | Light     | Dark      | Controls         |
| ------------------------ | --------- | --------- | ---------------- |
| `--jaamd-details-bg`     | `#eeeae5` | `#161b22` | Block background |
| `--jaamd-details-border` | `#c8c4bf` | `#30363d` | Outer border     |

## Spoiler

A spoiler hides text by matching its colour to its own background, so `--jaamd-spoiler-hidden-color` is applied to both `color` and `background-color`. Once activated by a click or by <kbd>Enter</kbd>/<kbd>Space</kbd>, the element switches to the revealed pair. Hovering does not reveal it.

| Token                          | Light     | Dark      | Controls                         |
| ------------------------------ | --------- | --------- | -------------------------------- |
| `--jaamd-spoiler-hidden-color` | `#1a1a1a` | `#e6edf3` | Text and background while hidden |
| `--jaamd-spoiler-revealed-bg`  | `#eeeae5` | `#161b22` | Background once revealed         |
| `--jaamd-spoiler-revealed-fg`  | `#3a3a3a` | `#c9d1d9` | Text once revealed               |

```css
:root {
  --jaamd-spoiler-hidden-color: #1a1a1a; /* same as background = invisible */
  --jaamd-spoiler-revealed-bg: var(--color-background-secondary);
  --jaamd-spoiler-revealed-fg: var(--color-foreground);
}
```

## Alerts

Each of the five GitHub-style [alert](/docs/markdown/alerts) variants exposes two tokens: `-color` for the left border and title, and `-bg` for the background fill. Changing just the colour token is often enough to adapt alerts to a different palette.

| Token                           | Light     | Dark                       | Controls                     |
| ------------------------------- | --------- | -------------------------- | ---------------------------- |
| `--jaamd-alert-note-color`      | `#0969da` | `#58a6ff`                  | `NOTE` border and title      |
| `--jaamd-alert-note-bg`         | `#dff0fd` | `rgba(56, 139, 253, 0.1)`  | `NOTE` fill                  |
| `--jaamd-alert-tip-color`       | `#1a7f37` | `#3fb950`                  | `TIP` border and title       |
| `--jaamd-alert-tip-bg`          | `#dafbe1` | `rgba(46, 160, 67, 0.1)`   | `TIP` fill                   |
| `--jaamd-alert-important-color` | `#8250df` | `#a371f7`                  | `IMPORTANT` border and title |
| `--jaamd-alert-important-bg`    | `#fbefff` | `rgba(163, 113, 247, 0.1)` | `IMPORTANT` fill             |
| `--jaamd-alert-warning-color`   | `#9a6700` | `#d29922`                  | `WARNING` border and title   |
| `--jaamd-alert-warning-bg`      | `#fff8c5` | `rgba(187, 128, 9, 0.1)`   | `WARNING` fill               |
| `--jaamd-alert-caution-color`   | `#cf222e` | `#f85149`                  | `CAUTION` border and title   |
| `--jaamd-alert-caution-bg`      | `#ffebe9` | `rgba(248, 81, 73, 0.1)`   | `CAUTION` fill               |

```css
:root {
  --jaamd-alert-note-color: var(--color-info);
  --jaamd-alert-note-bg: #e8f0fd;

  --jaamd-alert-tip-color: var(--color-success);
  --jaamd-alert-tip-bg: #e6f4ea;

  --jaamd-alert-warning-color: var(--color-warning);
  --jaamd-alert-warning-bg: #fffbeb;

  --jaamd-alert-caution-color: var(--color-error);
  --jaamd-alert-caution-bg: #fef2f2;

  --jaamd-alert-important-color: #7c3aed;
  --jaamd-alert-important-bg: #f5f3ff;
}
```
