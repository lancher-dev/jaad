# Structure

Documentation can contain top-level pages and one level of chapters:

```
docs/
  01-introduction.md
  02-guides/
    01-setup.md
    02-deployment.md
  03-reference.md
```

This produces `/`, `/guides/setup`, `/guides/deployment` and `/reference`.

## Rules

- Numeric prefixes control order and are removed from URLs.
- Files without a prefix sort after numbered files.
- A folder becomes a collapsible chapter.
- Only one folder level is supported, per language.
- The first `# Heading` becomes the page title.
- The first sorted page owns `routeBase`; its named URL redirects there.
- Removing prefixes must leave every page and chapter with a unique path.

Invalid nesting or duplicate paths stop the build and list the conflicting
source files.

The same structure generates the sidebar, mobile selectors, breadcrumbs and
previous/next links; no navigation configuration is required.

## Overriding the file tree

Optional [frontmatter](/docs/configurations/frontmatter) renames a page, moves
it without renaming the file, or keeps it out of the build:

```markdown
---
title: Images & Videos
label: Media
order: 5
draft: true
---
```

## More than one language

Directories named after language codes turn the tree into one site per
language, and the nesting limit then applies inside each of them. See
[Languages](/docs/configurations/i18n).
