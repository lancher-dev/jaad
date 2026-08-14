<h1 align="center">JAAD</h1>
<p align="center"><b>Just Another Astro Docs</b>. Write markdown. Get docs.</p>

An Astro integration that turns a folder of markdown into a documentation site.

```bash
npm create jaad@latest my-docs
```

Or add it to a repository that already has a `docs/` folder:

```bash
npm create jaad@latest -- --here
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
