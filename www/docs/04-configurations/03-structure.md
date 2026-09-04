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
- Only one folder level is supported.
- The first `# Heading` becomes the page title.
- The first sorted page owns `routeBase`; its named URL redirects there.
- Removing prefixes must leave every page and chapter with a unique path.

Invalid nesting or duplicate paths stop the build and list the conflicting
source files.

## Page titles

Use optional frontmatter when the navigation label should differ from the first
heading:

```markdown
---
title: Images & Videos
---

# Images and videos
```

The title affects navigation and metadata. The filename still determines the
URL.

The same structure generates the sidebar, mobile selectors, breadcrumbs and
previous/next links; no navigation configuration is required.
