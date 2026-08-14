<h1 align="center">create-jaad</h1>
<p align="center">Scaffold a <b>JAAD</b> documentation site, or add one to a repository that already has a <code>docs</code> folder.</p>

## A new site

```bash
npm create jaad@latest my-docs
```

Writes five files, installs, and leaves you with `npm run dev`.

```
my-docs/
  package.json
  astro.config.mjs        one line
  jaad.config.ts          the only file you open
  src/content.config.ts   one line
  docs/01-introduction.md
```

## A repository you already have

```bash
npm create jaad@latest -- --here
```

Adds the same three JAAD files and the dependencies, and leaves everything else
alone. Your `package.json` keeps its name, version, scripts and dependencies. If
`docs/` already has markdown, no sample page is written.

Nothing is ever overwritten: a file that exists is reported as kept.

## Options

|                   |                                                                    |
| ----------------- | ------------------------------------------------------------------ |
| `--here`          | Use the current directory instead of a new one.                    |
| `--title <title>` | Site title. Defaults to the package name, then the directory name. |
| `--no-install`    | Write the files and stop.                                          |

## Documentation

[jaad.lancher.dev](https://jaad.lancher.dev)

## License

MIT
