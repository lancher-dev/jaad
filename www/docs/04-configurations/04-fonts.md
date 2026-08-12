# Fonts

JAAD ships with Inter for the interface and Merriweather for headings. Both are downloaded and self-hosted at build time by Astro, so no request ever reaches a third-party host at runtime.

## Changing them

Fonts are CSS tokens, not configuration. Set them in `src/jaad.css`:

```css
/* src/jaad.css */
:root {
  --font-sans: "IBM Plex Sans", system-ui, sans-serif;
  --font-serif: "IBM Plex Serif", Georgia, serif;
  --font-mono: "IBM Plex Mono", monospace;
}
```

The three tokens cover everything: `--font-sans` for interface and body text, `--font-serif` for headings, `--font-mono` for code.

## Loading a different family

Overriding the token changes which family is used, but it does not fetch it. To load your own, use Astro's font support in `astro.config.mjs` and point the token at the variable it creates:

```js
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  fonts: [
    {
      provider: fontProviders.google(),
      name: "IBM Plex Sans",
      cssVariable: "--font-plex",
      weights: [400, 600],
    },
  ],
});
```

```css
/* src/jaad.css */
:root {
  --font-sans: var(--font-plex), system-ui, sans-serif;
}
```

Astro merges your `fonts` array with the one JAAD adds, so both sets are available.

## Using system fonts only

To drop webfonts entirely, point the tokens at the system stack:

```css
:root {
  --font-sans: system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-serif: Georgia, "Times New Roman", serif;
}
```

> [!NOTE]
> The bundled families are still downloaded at build time even when unused. There is currently no option to skip them; if that becomes a problem for offline builds, it is worth opening an issue.
