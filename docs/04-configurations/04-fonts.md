# Fonts

JAAD uses two typefaces: **Inter** for body text and UI elements, and **Merriweather** for headings.

## Self-hosted delivery

Fonts are not loaded from a third-party CDN. At build time, Astro downloads them from Google Fonts and places the woff2 files in `dist/_astro/fonts/`. Each page ships with `<link rel="preload">` tags so the browser begins fetching the fonts as early as possible, and optimised fallback metrics (`size-adjust`, `ascent-override`, …) are generated automatically to minimise layout shift during the swap period.

## Changing fonts

Font families are configured in `astro.config.mjs`:

```js
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  experimental: {
    fonts: [
      {
        provider: fontProviders.google(),
        name: "Inter",
        cssVariable: "--font-inter",
        weights: [400, 500, 600],
        styles: ["normal"],
      },
      {
        provider: fontProviders.google(),
        name: "Merriweather",
        cssVariable: "--font-merriweather",
        weights: [300, 400, 700],
        styles: ["normal", "italic"],
      },
    ],
  },
});
```

Change `name` to any family on [Google Fonts](https://fonts.google.com), or switch `provider` to load from a different source: Bunny, Fontsource, or local files on disk are all supported out of the box.

The variables `--font-inter` and `--font-merriweather` are referenced in `global.css` and forwarded to JAAMD's theming tokens (`--jaamd-font-sans`, `--jaamd-font-mono`). If you rename a font family, update those tokens in `global.css` as well:

```css
/* src/styles/global.css */
:root {
  --jaamd-font-sans: var(--font-my-custom-family), ui-sans-serif, sans-serif;
}
```

For the full list of providers and options see the [Astro fonts documentation](https://docs.astro.build/en/reference/experimental-flags/fonts/).
