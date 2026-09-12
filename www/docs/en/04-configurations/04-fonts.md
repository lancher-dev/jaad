# Fonts

JAAD uses self-hosted Inter for the interface and Merriweather for headings.
Override the font tokens in `src/jaad.css`:

```css
:root {
  --font-sans: "IBM Plex Sans", system-ui, sans-serif;
  --font-serif: "IBM Plex Serif", Georgia, serif;
  --font-mono: "IBM Plex Mono", monospace;
}
```

Changing a token does not load the font. Add custom families with Astro's font
configuration, then reference its CSS variable:

```ts
// jaad.config.ts
import { fontProviders } from "astro/config";
import { defineJaadConfig } from "@lancher-dev/jaad";

export default defineJaadConfig({
  title: "My Project",
  astro: {
    fonts: [
      {
        provider: fontProviders.google(),
        name: "IBM Plex Sans",
        cssVariable: "--font-plex",
        weights: [400, 600],
      },
    ],
  },
});
```

```css
:root {
  --font-sans: var(--font-plex), system-ui, sans-serif;
}
```

For system fonts only, point the tokens directly at a system stack. JAAD's
bundled fonts are still downloaded during the build even when unused.
