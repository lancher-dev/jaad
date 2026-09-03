<p align="center">
  <a href="https://jaad.lancher.dev">
    <img src="./.github/readme-header.png" alt="JAAD — Just Another Astro Docs. Documentation, simplified." width="1200" />
  </a>
</p>

<p align="center">
  An <a href="https://astro.build">Astro</a> integration that turns a folder of markdown into a documentation site.
</p>

<div align="center">

[![main](https://github.com/lancher-dev/jaad/actions/workflows/ci.yml/badge.svg)](https://github.com/lancher-dev/jaad/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/withastro/astro/blob/main/LICENSE)
[![npm version](https://badge.fury.io/js/@lancher-dev%2Fjaad.svg)](https://badge.fury.io/js/@lancher-dev%2Fjaad)
</div>

```bash
npm create @lancher-dev/jaad@latest my-docs
```

Or add it to a repository that already has a `docs/` folder:

```bash
npm create @lancher-dev/jaad@latest -- --here
```

By hand:

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

Documentation: [jaad.lancher.dev](https://jaad.lancher.dev)

## License

jaad is released under the [MIT License](/LICENSE).
