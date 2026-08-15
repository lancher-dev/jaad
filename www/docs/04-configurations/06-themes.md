# Themes

Dark mode is built in and needs no configuration. The switcher in the header toggles it, starting from the reader's system preference. If your site is only ever one of the two, [pin it](#fixing-the-appearance) and the switcher goes away.

## Named themes

One word sets the site chrome, the rendered markdown and the code block colours together:

```ts
defineJaadConfig({ title: "My Project", theme: "dracula" });
```

| Name             | Light         | Dark         |
| ---------------- | ------------- | ------------ |
| `default`        | Paper         | GitHub Dark  |
| `catppuccin`     | Latte         | Mocha        |
| `gruvbox`        | Gruvbox Light | Gruvbox Dark |
| `rose-pine`      | Dawn          | Rosé Pine    |
| `rose-pine-moon` | Dawn          | Moon         |
| `dracula`        | Dracula       | Dracula      |
| `nord`           | Nord          | Nord         |
| `one-dark`       | One Dark      | One Dark     |
| `tokyo-night`    | Tokyo Night   | Tokyo Night  |

An unknown name stops the build and lists the ones that exist, so a typo never falls back silently.

`catppuccin`, `gruvbox` and the two `rose-pine` variants have an official light palette, so the toggle changes the colours. `dracula`, `nord`, `one-dark` and `tokyo-night` have no official light counterpart and stay dark in both modes.

Palettes come from each project's own reference, paired with the matching code theme.

## How it works

A `dark` class on `<html>` drives the theme. A small inline script in `<head>` reads the stored preference, or falls back to `prefers-color-scheme`, and applies the class before the first paint, so there is no flash of the wrong theme.

A theme sets a handful of seed values; everything else derives from them. See [Styles](/docs/configurations/styles) for the token model.

## Fixing the appearance

Some sites are one thing only. `appearance` pins them:

```ts
defineJaadConfig({
  title: "My Project",
  theme: "tokyo-night",
  appearance: "dark",
});
```

`"dark"` puts the class on `<html>` at build time and `"light"` leaves it off. Either way the switcher disappears and no theme script is sent: the page is right without JavaScript, and there is no flash to prevent. The default, `"auto"`, is the behaviour described above.

This is what the four dark-only palettes want. `dracula`, `nord`, `one-dark` and `tokyo-night` have no light counterpart, so in light mode their chrome stays dark while the rendered markdown turns light. Pinning the site to `"dark"` settles it. The pairing to avoid is the opposite one — `appearance: "light"` with a palette that has no light mode.

## Code blocks only

To change syntax highlighting without touching the colours, pass a [Shiki](https://shiki.style/themes) pair instead of a name:

```ts
defineJaadConfig({
  title: "My Project",
  theme: { light: "github-light", dark: "github-dark" },
});
```

## Your own

A theme is nine values. Set them in `src/jaad.css` and everything follows:

```css
/* src/jaad.css */
:root,
html.dark {
  --color-background: #1e1e2e;
  --color-surface: #313244;
  --color-foreground: #cdd6f4;
  --color-foreground-bright: #f5f5f5;
  --color-primary: #89b4fa;

  --color-error: #f38ba8;
  --color-warning: #f9e2af;
  --color-info: #89dceb;
  --color-success: #a6e3a1;
}
```

Use `:root` alone for a light theme, `html.dark` alone to restyle only dark mode, or both together to apply it everywhere. Pair it with a Shiki theme so the code matches.

## Exceptions

Hand-designed palettes are not always tints of their background. Dracula's borders are a distinct blue, and its tab strip is _darker_ than the page, which a scale that mixes text into background cannot produce.

For those cases, override the token by name:

```css
:root,
html.dark {
  --jaamd-border-strong: #6272a4;
  --jaamd-tabs-header-bg: #21222c;
  --jaamd-em-fg: #8be9fd;
}
```

The bundled themes do exactly this, and only where the palette demands it.
