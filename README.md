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
