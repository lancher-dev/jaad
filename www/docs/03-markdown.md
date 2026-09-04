# Markdown

JAAD supports [CommonMark](https://commonmark.org/help/) and
[GitHub Flavored Markdown](https://github.github.com/gfm/).
[JAAMD](https://github.com/lancher-dev/jaamd) adds the features below
automatically.

## Code tabs

Use `:::code-tabs` and add the tab label after each language identifier:

````markdown
:::code-tabs

```bash npm
npm install
```

```bash pnpm
pnpm install
```

:::
````

:::code-tabs

```bash npm
npm install
```

```bash pnpm
pnpm install
```

:::

## Alerts

Use GitHub-style blockquote alerts:

```markdown
> [!NOTE]
> Useful context.

> [!WARNING]
> A consequence the reader should avoid.
```

> [!NOTE]
> Useful context.

Available types are `NOTE`, `TIP`, `IMPORTANT`, `WARNING` and `CAUTION`.

## Spoilers

Add the `spoiler` class to inline or block HTML:

```html
The answer is <span class="spoiler">42</span>.
```

Spoilers are keyboard accessible and return to their hidden state after a page
reload.

## Automatic enhancements

JAAD also adds copy buttons to code blocks, links to headings, an image
lightbox and animated `<details>` elements. No configuration is required.
