# Themes

JAAD ships with full dark mode support and integrates with JAAMD's theming system. The theme switcher in the header toggles between light and dark, defaulting to the system preference.

## How it works

Dark mode is driven by a `dark` class on `<html>`. A small inline script in `<head>` reads the user's preference from `localStorage` (or falls back to `prefers-color-scheme`) and applies the class before the first paint — no flash of wrong theme.

JAAD defines two sets of design tokens in `global.css`: light (default) and dark (inside `html.dark`). JAAMD's default variable set also includes matching dark-mode overrides, so markdown content adapts automatically.

## Customizing colors

All layout tokens live in `src/styles/global.css` under `@theme` (light) and `html.dark` (dark). Change any value to match your brand:

```css
/* src/styles/global.css */
@theme {
  --color-primary: #6366f1;
  --color-background: #faf8f5;
}

html.dark {
  --color-primary: #818cf8;
  --color-background: #0d1117;
}
```

Markdown-specific tokens are in `src/styles/jaamd.css`. Both light and dark overrides are defined there. See [Styles](/docs/configurations/styles) for the full list.

## Shiki dual themes

JAAD configures JAAMD with dual Shiki themes so syntax highlighting adapts to the current mode:

```js
// astro.config.mjs
jaamd({
  theme: { light: "github-light", dark: "github-dark" },
});
```

When `theme` is an object, JAAMD switches code-block token colours based on `html.dark`. Any pair of [Shiki themes](https://shiki.style/themes) can be used.

## JAAMD theme presets

JAAMD includes three additional theme presets that override all `--jaamd-*` variables to match popular editor colour schemes:

| Preset   | Import                  | Shiki theme    |
| -------- | ----------------------- | -------------- |
| Dracula  | `jaamd/themes/dracula`  | `dracula`      |
| Nord     | `jaamd/themes/nord`     | `nord`         |
| One Dark | `jaamd/themes/one-dark` | `one-dark-pro` |

Use a preset as a standalone theme:

```ts
jaamd({ theme: "dracula", noDefault: true });
```

```css
@import "jaamd/themes/dracula.css";
@import "jaamd/styles.css";
```

Or scope it to dark mode with the `/dark` variant:

```css
@import "jaamd/themes/dracula/dark.css";
```

```ts
import "jaamd/themes/dracula/dark";
```

## Creating a custom theme

Copy any preset from `jaamd/src/themes/` and change the variable values. All 50 `--jaamd-*` properties are listed with their light and dark defaults in [Styles](/docs/configurations/styles). Override them on `:root` or scope them under `html.dark` to create a custom dark theme.
