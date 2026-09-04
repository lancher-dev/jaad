# Advanced documentation layout

The default layout is intended to work without configuration. If a project
needs a different documentation structure, create this file:

```
src/jaad/DocsFrame.astro
```

JAAD detects it automatically. There is no configuration option. Restart the
development server after creating the file for the first time; later edits are
watched normally.

The frame controls the contents of `<body data-docs>`. JAAD continues to own the
HTML document, metadata, structured data, fonts, theme styles, view transitions
and keyboard navigation.

## Frame contract

JAAD passes each standard element through a named slot:

| Slot                | Contents                                    |
| ------------------- | ------------------------------------------- |
| `header`            | Documentation header, navigation and search |
| `sidebar`           | Desktop page navigation                     |
| `mobile-navigation` | Mobile page and heading selectors           |
| `breadcrumbs`       | Current documentation path                  |
| `page-actions`      | Copy and edit actions                       |
| `content`           | Rendered Markdown article                   |
| `page-navigation`   | Previous and next page links                |
| `table-of-contents` | Desktop heading navigation                  |
| `footer`            | Documentation footer                        |

Render a slot wherever that element should appear. Leaving a slot out removes
the element from every documentation page.

```astro
---
// src/jaad/DocsFrame.astro
import type { DocsFrameProps } from "@lancher-dev/jaad/advanced";

type Props = DocsFrameProps;
const { page, headings } = Astro.props;
---

<div class="docs-frame" data-page={page.id}>
  <slot name="header" />
  <slot name="mobile-navigation" />

  <div class="docs-grid">
    <slot name="sidebar" />

    <main>
      <slot name="breadcrumbs" />
      <slot name="page-actions" />
      <slot name="content" />
      <slot name="page-navigation" />
    </main>

    {headings.length > 0 && <slot name="table-of-contents" />}
  </div>

  <slot name="footer" />
</div>

<style>
  .docs-grid {
    display: grid;
    grid-template-columns: minmax(0, 56rem);
    justify-content: center;
  }

  @media (min-width: 64rem) {
    .docs-grid {
      grid-template-columns: 16rem minmax(0, 56rem) 16rem;
    }
  }

  @media (max-width: 63.999rem) {
    :global(.docs-sidebar-left),
    :global(.docs-sidebar-right) {
      display: none;
    }
  }
</style>
```

`DocsFrameProps` also exposes the current page, headings and complete
navigation model. This allows conditional placement without making JAAD's
internal components part of the public API.

The frame is an advanced escape hatch. For colours, fonts, widths and spacing,
prefer [`src/jaad.css`](/docs/configurations/styles); it keeps the default
responsive and accessible structure intact.
