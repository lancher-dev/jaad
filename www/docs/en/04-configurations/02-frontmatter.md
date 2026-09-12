---
description: Every frontmatter field JAAD reads, and what each one changes.
keywords: [frontmatter, metadata, seo]
---

# Frontmatter

Frontmatter is optional. Markdown without it works as-is: the filename sets the
order and the URL, and the first `# Heading` sets the title. Each field below
overrides something the file tree or the body already supplies.

```markdown
---
title: Images & Videos
label: Media
description: Add accessible images and embedded videos.
keywords: [markdown, media]
order: 5
draft: false
author: Ada Lovelace
ogImage: /og/media.png
lastUpdated: 2026-09-12
---

# Images and videos
```

| Field         | Type              | Effect                                       |
| ------------- | ----------------- | -------------------------------------------- |
| `title`       | `string`          | Page title, everywhere the page is named     |
| `label`       | `string`          | Shorter name, in navigation only             |
| `description` | `string`          | Description metadata and `llms.txt`          |
| `order`       | `number`          | Replaces the number from the filename prefix |
| `draft`       | `boolean`         | Kept in development, left out of the build   |
| `keywords`    | `string[]`        | Keyword metadata, and weight in search       |
| `author`      | `string`          | Author metadata                              |
| `ogImage`     | `string \| false` | Social image for this page                   |
| `lastUpdated` | `date`            | Modification date in metadata                |

Fields JAAD does not know are ignored, so frontmatter your own tooling
reads can sit alongside these. A wrong type is a build error.

## Naming

`title` names the page in metadata, breadcrumbs, search and the table of
contents. The filename still determines the URL, whatever the title says.

`label` is for pages whose title is too long for a sidebar entry. It changes
the sidebar, the mobile selectors and the previous/next links, and nothing
else:

```markdown
---
title: Frequently Asked Questions
label: FAQ
---
```

Without `title`, JAAD uses the first `# Heading`, then the filename.

## Ordering and drafts

`order` replaces the number a filename prefix supplies, so a page can move
without being renamed. Inside a chapter it moves the page within that chapter;
the chapter keeps the order of its own directory prefix.

```markdown
---
order: 0
---
```

A page ordered ahead of every other becomes the opening page at `routeBase`.

`draft` pages are served in development and left out of production builds:
they disappear from routes, navigation, search, the sitemap and `llms.txt`.
The file tree is still validated as a whole, so a draft that would collide
with another page is reported while it is being written.

## Metadata

`description` is used for the description metadata, Open Graph, structured
data and `llms.txt`. Without it, JAAD uses an excerpt from the page, followed
by the site description.

`keywords` become `<meta name="keywords">` and the `keywords` of the page's
structured data, and they rank a page in search below its chapter and above
its body. They are metadata, not a visible list: JAAD renders nothing for
them, though a frame of your own can, through
[`page.data`](/docs/configurations/advanced-layout).

`author` becomes `<meta name="author">` and the structured-data author.

`ogImage` overrides the site's social image for one page. It takes a public
path or an absolute URL, and `false` removes the image from that page. Local
paths need `site` to resolve, as elsewhere.

`lastUpdated` takes a date, and becomes `article:modified_time` and
`dateModified` in structured data. JAAD does not display it.
