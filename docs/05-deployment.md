# Deployment

JAAD is built on Astro and produces a fully static site, making deployment straightforward on any static hosting platform. For detailed guides on deploying to Netlify, Vercel, GitHub Pages, and more, refer to the [official Astro deployment documentation](https://docs.astro.build/en/guides/deploy/).

If your site lives at a subdirectory (e.g. `https://username.github.io/repo-name/`), set the `base` option in `astro.config.mjs` before building:

```js
export default defineConfig({
  site: "https://username.github.io",
  base: "/repo-name",
});
```
