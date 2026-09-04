# Overview

JAAD is an Astro integration that turns a folder of Markdown files into a
documentation site. It provides navigation, search, theming and static output
without requiring a sidebar or route configuration.

Create a documentation-only project:

```bash
npm create @lancher-dev/jaad@latest my-docs
```

Or add JAAD to a repository that already has documentation:

```bash
npm create @lancher-dev/jaad@latest -- --here
```

Markdown files live in `docs/`. Numeric prefixes control their order and are
removed from generated URLs:

```
docs/
  01-introduction.md
  02-guides/
    01-setup.md
```

Continue with [Installation](/docs/getting-started/installation), learn how to
[create pages](/docs/getting-started/creating-pages), or open the
[configuration reference](/docs/configurations/reference).
