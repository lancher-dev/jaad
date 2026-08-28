# Custom pages

Anything outside `docs/` is an ordinary Astro page in `src/pages/`. JAAD exports the layout its own pages use, so a landing page, a changelog or a pricing page gets the same header, footer, fonts and theme without you rebuilding them.

```astro
---
// src/pages/index.astro
import Layout from "@lancher-dev/jaad/layouts/Base.astro";
---

<Layout title="Home">
  <h1>My Project</h1>
  <p>Write markdown. Get docs.</p>
</Layout>
```

## What the layout already gives you

|          |                                                                          |
| -------- | ------------------------------------------------------------------------ |
| `<head>` | Title, description, canonical URL, Open Graph and Twitter cards, favicon |
| Header   | Logo or title, `nav`, `social`, the theme switch                         |
| Footer   | Your `footer` line                                                       |
| Theme    | Colours, fonts and the light/dark choice                                 |

`title` and `description` are optional. Without them the page uses the site title and description, and `title` is composed as `Page | Site` the same way documentation pages are.

## Taking the whole page

The layout centres your content and gives it breathing room, which is what a text page wants and what a full-width hero does not. `bare` removes that spacing and leaves the width to you:

```astro
<Layout bare>
  <section class="w-full bg-[var(--color-background-secondary)] py-24">
    <h1 class="text-center">Edge to edge</h1>
  </section>
</Layout>
```

The `<main>` element is still there, so screen readers still find the page's main landmark. Only the spacing goes.

## Widths

Header, footer, documentation content and sidebars all measure themselves against four custom properties. Set them in `src/jaad.css` and everything follows, including where the sidebars sit:

```css
/* src/jaad.css */
:root {
  --jaad-content-width: 64rem;
  --jaad-sidebar-width: 18rem;
}
```

| Token                  | Default           | What it sets                                                       |
| ---------------------- | ----------------- | ------------------------------------------------------------------ |
| `--jaad-content-width` | `56rem`           | Documentation column, and the measure everything else derives from |
| `--jaad-chrome-width`  | the content width | Header and footer, so they line up with the content                |
| `--jaad-sidebar-width` | `16rem`           | Navigation and table of contents                                   |
| `--jaad-page-padding`  | `2rem`            | Side padding of a `Base` page, doubled on large screens            |

Set `--jaad-chrome-width` on its own if you want a header wider than the text under it.

## What the header shows

The header is built from configuration, not from props: the logo or title, `nav`, `social` and the theme switch. Change what appears by changing those options, and change how wide it is with `--jaad-chrome-width`.

Every page that uses `Base` gets it. If you need a page with no header at all, that page does not use `Base`, and then the `<head>` tags, the stylesheet and the theme script are yours to write.
