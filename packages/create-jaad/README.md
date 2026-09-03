<h1 align="center">create-jaad</h1>
<p align="center">Scaffold a <b>JAAD</b> documentation site, or add documentation to a larger Astro site.</p>

## How to use

```bash
npm create @lancher-dev/jaad@latest my-docs
```

Writes five files, installs, and leaves you with `npm run dev`.

## A repository you already have

```bash
npm create @lancher-dev/jaad@latest -- --here
```

Adds the same three JAAD files and the dependencies, and leaves everything else
alone. Your `package.json` keeps its name, version, scripts and dependencies. If
`docs/` already has markdown, no sample page is written.

Nothing is ever overwritten: a file that exists is reported as kept.

## Options

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| `[directory]`             | Create the project in this directory.                   |
| `--here`                  | Use the current directory instead of a new one.         |
| `--template <docs\|site>` | Put docs at `/`, or add a landing with docs at `/docs`. |
| `--title <title>`         | Set the site title.                                     |
| `--install`               | Install dependencies after writing the files.           |
| `--no-install`            | Write the files and stop.                               |

Interactive prompts offer useful defaults. In CI and other non-interactive
environments every answer must be provided explicitly: a directory or
`--here`, a template, a title, and either `--install` or `--no-install`.

## Documentation

[jaad.lancher.dev](https://jaad.lancher.dev)

## License

jaad is released under the [MIT License](/LICENSE).
