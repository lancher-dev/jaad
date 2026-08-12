<h1 align="center">JAAD</h1>
<p align="center"><b>Just Another Astro Docs</b>. Write markdown. Get docs.</p>

An Astro integration that turns a folder of markdown into a documentation site.

```bash
npm install jaad
```

```js
// astro.config.mjs
import jaad from "jaad";

export default defineConfig({
  site: "https://example.dev",
  integrations: [jaad({ title: "My Project" })],
});
```

Documentation: [jaad.lancher.dev](https://jaad.lancher.dev)

## This repository

| Path            | What                                           |
| --------------- | ---------------------------------------------- |
| `packages/jaad` | The published package                          |
| `www`           | The documentation site, built with the package |
| `tests`         | Unit, build output and consumer install suites |

```bash
pnpm install
pnpm dev             # run the site
pnpm test            # unit tests
pnpm build           # build the site
pnpm test:build      # assertions on the built output
pnpm test:consumer   # install the packed tarball into a throwaway project
pnpm check           # typecheck both workspaces
```

The `template` tag marks the last state of JAAD as a repository you cloned, before it became a package.

## License

jaad is released under the [MIT License](/LICENSE).
