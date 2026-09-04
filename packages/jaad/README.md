<p align="center">
  <br/>
  <a href="https://jaad.lancher.dev">JAAD</a> is <b>Just Another Astro Docs</b>,<br/>
  an <a href="https://astro.build">Astro</a> integration that turns a folder of markdown into a documentation site.<br/>
  <br/><br/>
</p>

<div align="center">

[![main](https://github.com/lancher-dev/jaad/actions/workflows/ci.yml/badge.svg)](https://github.com/lancher-dev/jaad/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/withastro/astro/blob/main/LICENSE)
[![npm version](https://badge.fury.io/js/@lancher-dev%2Fjaad.svg)](https://badge.fury.io/js/@lancher-dev%2Fjaad)

</div>

## Install

```bash
npm create @lancher-dev/jaad@latest my-docs
```

Or by hand:

```bash
npm install @lancher-dev/jaad
```

```ts
// jaad.config.ts
import { defineJaadConfig } from "@lancher-dev/jaad";

export default defineJaadConfig({
  site: "https://example.dev",
  title: "My Project",
});
```

```js
// astro.config.mjs
export { default } from "@lancher-dev/jaad/site";
```

```ts
// src/content.config.ts
export { collections } from "@lancher-dev/jaad/content";
```

Then write markdown in `docs/`:

```
docs/
  01-introduction.md   → / (and /introduction redirects here)
  02-guides/           → chapter "Guides"
    01-setup.md        → /guides/setup
```

Numbers set the order and are stripped from the URL. Folders become chapters. The first `# Heading` is the page title.
Set `routeBase: "/docs"` when a landing page should own `/` and the
documentation should live below it.

Pages outside the documentation use their own Astro layouts. Advanced projects
can rearrange the documentation UI with the optional
`src/jaad/DocsFrame.astro` convention; the default needs no configuration.

## Documentation

[jaad.lancher.dev](https://jaad.lancher.dev)

## License

jaad is released under the [MIT License](./LICENSE).
