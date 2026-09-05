# Themes

Dark mode works without configuration. The default `appearance: "auto"`
follows the reader's system preference and shows a switcher.

## Named themes

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

Unknown names stop the build. Themes without a light palette stay dark in both
modes; use `appearance: "dark"` for a consistently dark site.

## Fixed appearance

```ts
defineJaadConfig({
  title: "My Project",
  theme: "tokyo-night",
  appearance: "dark",
});
```

`"light"` and `"dark"` remove the switcher and the client-side preference
script. The default is `"auto"`.

## Code theme only

Pass a [Shiki](https://shiki.style/themes) pair to change syntax highlighting
without changing the interface colours:

```ts
defineJaadConfig({
  title: "My Project",
  theme: { light: "github-light", dark: "github-dark" },
});
```

## Custom themes

Set theme seeds in `src/jaad.css`:

```css
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

Use `:root` for light mode and `html.dark` for dark mode. Override individual
`--jaamd-` tokens only when a palette needs values that cannot derive from the
seeds.

## Sharing the theme with your own pages

[Pages of your own](/docs/configurations/custom-pages) use your layout, not
JAAD's. Two values keep both halves of a site in step:

| What                      | Value                         |
| ------------------------- | ----------------------------- |
| Class on `<html>` in dark | `dark`                        |
| Stored preference         | `localStorage["theme"]`       |
| Stored values             | `"dark"` / `"light"`          |
| No stored value           | follow `prefers-color-scheme` |

Apply the class in the `<head>`, before anything paints:

```astro
<script is:inline>
  (function () {
    var t = localStorage.getItem("theme");
    var dark =
      t === "dark" ||
      (!t && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  })();
</script>
```

Write `"dark"` or `"light"` to that key from your own switcher. JAAD reads it
again on the next documentation page.
