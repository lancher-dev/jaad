# Structure

Documentation files can be organized flat or nested one level into chapters.
Both approaches work with the same markdown syntax and automatic navigation
generation.

## Flat Organization

Place numbered markdown files directly in the docs directory. Each file becomes a top-level page in the sidebar. This works well for shorter documentation with fewer than ten pages.

Example structure:

```
docs/
  01-getting-started.md
  02-markdown-reference.md
  03-structure.md
  04-deployment.md
```

The numbers control sidebar order. The first page owns the configured
`routeBase`; later URLs remove the number prefix. With the default root route,
`02-markdown-reference.md` becomes `/markdown-reference`. Page titles come from
the first heading in each file.

## Chapter Organization

Group related pages into numbered folders. Each folder becomes a collapsible chapter in the sidebar. Files within folders can also be numbered to control their order within the chapter.

Example structure:

```
docs/
  01-introduction/
    01-overview.md
    02-installation.md
  02-guides/
    01-basic-usage.md
    02-advanced-topics.md
  03-reference/
    01-configuration.md
    02-api.md
```

Folders and files both strip their number prefixes from URLs. The file `01-introduction/02-installation.md` becomes `/introduction/installation`. Chapter names come from folder names converted to title case.

One folder level is the complete hierarchy: `docs/guides/setup.md` is valid,
while `docs/guides/basics/setup.md` stops the build with a clear error. A
deeper tree cannot be represented faithfully by JAAD's chapter navigation.

## File Naming

Choose descriptive names using lowercase letters and hyphens. The conversion to page titles happens automatically. A file named `advanced-configuration.md` displays as "Advanced Configuration" in the sidebar.

Number prefixes can contain one or more digits. Files without number prefixes
sort after numbered files; use prefixes whenever their relative order matters.

Removing those prefixes must leave every page and chapter with a unique path.
For example, `01-guide.md` and `02-guide.md` both become `/guide`, so JAAD lists
both source files and stops the build instead of letting Astro report an opaque
route collision. The same check applies to folders such as `01-guides/` and
`guides/`.

## Page Title

The first `# Heading` in each file is used as the page title: in the sidebar, the browser tab, and the previous/next navigation bar.

For most files this is automatic and needs no configuration. If a filename contains characters that the build process strips from URLs (such as `&` in `07-images-&-videos.md`), or if you simply want a different display name, add an optional `title` field in frontmatter:

```markdown
---
title: Images & Videos
---

# Images & Videos

...
```

The `title` field controls only how the page appears in navigation. The URL is always derived from the filename. The field is never required. Files without any frontmatter work exactly as before.

## Navigation Generation

The sidebar builds automatically from the file structure. Current page highlighting, chapter grouping, and previous-next navigation all derive from file organization. No configuration files or frontmatter required.

On mobile devices, the sidebar becomes a dropdown selector. The table of contents for the current page appears in a separate dropdown below the page selector.
