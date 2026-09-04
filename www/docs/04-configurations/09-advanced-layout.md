# Advanced documentation layout

Use the default layout unless the documentation needs a different structure.
To replace it, create:

```
src/jaad/DocsFrame.astro
```

JAAD detects the file automatically. Restart the development server after
creating it; later edits are watched.

The frame controls `<body data-docs>`. JAAD still owns the HTML document,
metadata, theme, fonts, view transitions and keyboard navigation.

## Frame contract

| Slot                | Contents                          |
| ------------------- | --------------------------------- |
| `header`            | Header, navigation and search     |
| `sidebar`           | Desktop page navigation           |
| `mobile-navigation` | Mobile page and heading selectors |
| `breadcrumbs`       | Current documentation path        |
| `page-actions`      | Copy and edit actions             |
| `content`           | Rendered Markdown article         |
| `page-navigation`   | Previous and next links           |
| `table-of-contents` | Desktop heading navigation        |
| `footer`            | Documentation footer              |

Omitting a slot removes that element from every documentation page.

```astro
---
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

`DocsFrameProps` exposes the current page, headings and navigation model for
conditional placement. JAAD's internal components are not part of this API.

For colours, fonts, widths and spacing, use
[`src/jaad.css`](/docs/configurations/styles) instead.
