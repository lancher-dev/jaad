# Themes

Dark mode is built in and needs no configuration. The switcher in the header toggles it, starting from the reader's system preference.

## How it works

A `dark` class on `<html>` drives everything. A small inline script in `<head>` reads the stored preference, or falls back to `prefers-color-scheme`, and applies the class before the first paint, so there is no flash of the wrong theme.

To change the colours in either mode, define them in `src/jaad.css`:

```css
:root {
  --color-primary: #3b5bdb;
}

html.dark {
  --color-primary: #748ffc;
}
```

## Code block themes

Syntax highlighting uses [Shiki](https://shiki.style/themes). Pass a pair and code follows the light/dark toggle:

```js
jaad({
  title: "My Project",
  theme: { light: "github-light", dark: "github-dark" },
});
```

A single string pins one theme in both modes:

```js
jaad({ title: "My Project", theme: "dracula" });
```

## JAAMD theme presets

The markdown styles come from JAAMD, which ships three presets that restyle the rendered content to match popular editor schemes.

| Preset   | Import                  | Pairs with Shiki |
| -------- | ----------------------- | ---------------- |
| Dracula  | `jaamd/themes/dracula`  | `dracula`        |
| Nord     | `jaamd/themes/nord`     | `nord`           |
| One Dark | `jaamd/themes/one-dark` | `one-dark-pro`   |

Import one from `src/jaad.css` and pair it with the matching Shiki theme:

```css
/* src/jaad.css */
@import "jaamd/themes/dracula.css";
```

```js
jaad({ title: "My Project", theme: "dracula" });
```

Each preset also has a `/dark` variant that applies only under `html.dark`, so you can keep the default look in light mode:

```css
@import "jaamd/themes/dracula/dark.css";
```

## Rolling your own

Rather than copying a preset, set the JAAMD seed tokens and let the rest derive:

```css
:root {
  --jaamd-bg: #282a36;
  --jaamd-color-fg: #f8f8f2;
  --jaamd-color-primary: #bd93f9;
}
```

Surfaces, borders and alert backgrounds are computed from those, so they stay consistent without being listed. Override individual `--jaamd-*` tokens by name when you want an exception. The presets do exactly that, because hand-picked editor palettes are not tints of a background.
