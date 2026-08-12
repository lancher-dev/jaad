# Themes

Dark mode is built in and needs no configuration. The switcher in the header toggles it, starting from the reader's system preference.

## Named themes

One word sets the site chrome, the rendered markdown and the code block colours together:

```js
jaad({ title: "My Project", theme: "dracula" });
```

| Name       | Notes                                  |
| ---------- | -------------------------------------- |
| `default`  | Paper light, GitHub dark. The default. |
| `dracula`  | Dark in both modes                     |
| `nord`     | Dark in both modes                     |
| `one-dark` | Dark in both modes                     |

An unknown name stops the build and lists the ones that exist, so a typo never falls back silently.

Everything except `default` is a dark palette applied in **both** modes: the toggle still works, but the colours do not change. To keep a light mode as well, set the theme's values yourself under `html.dark` only.

## How it works

A `dark` class on `<html>` drives the theme. A small inline script in `<head>` reads the stored preference, or falls back to `prefers-color-scheme`, and applies the class before the first paint, so there is no flash of the wrong theme.

A theme is a short list of seed values. Surfaces, borders, muted text and alert backgrounds are computed from them with `color-mix()`, which is why the chrome and the markdown never drift apart.

## Code blocks only

To change syntax highlighting without touching the colours, pass a [Shiki](https://shiki.style/themes) pair instead of a name:

```js
jaad({
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

> [!NOTE]
> The derived values use `color-mix()`, supported in Chrome and Edge 111+, Safari 16.2+ and Firefox 113+. On older browsers those colours do not apply.
