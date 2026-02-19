# Markdown Reference

This page demonstrates all available markdown syntax and styling options in JAAD. JAAD supports [CommonMark](https://commonmark.org/help/) and [GitHub Flavored Markdown (GFM)](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax) — refer to those references for the full specification.

## Text Formatting

```
Regular paragraph text appears in the default body font.
**Bold text** uses a heavier weight for emphasis.
_Italic text_ provides subtle emphasis with a slanted style.
**_Bold and italic_** combined for stronger emphasis.
~~Strikethrough text~~ crosses out content.
Inline `code` appears with a distinct monospace font.
```

Regular paragraph text appears in the default body font. **Bold text** uses a heavier weight for emphasis. _Italic text_ provides subtle emphasis with a slanted style. You can combine **_bold and italic_** together for stronger emphasis.

~~Strikethrough text~~ crosses out content using double tildes. Inline `code` appears with a distinct monospace font and background, useful for function names, variables, or short commands.

## Headings

```
# Heading Level 1
## Heading Level 2
### Heading Level 3
#### Heading Level 4
```

<div data-toc-ignore>

# Heading Level 1

Heading level one typically serves as the page title. Only use one per document.

## Heading Level 2

Level two headings create major sections and appear in the table of contents with a subtle underline.

### Heading Level 3

Level three headings create subsections and also appear in the table of contents.

#### Heading Level 4

Level four headings provide additional hierarchy without appearing in the table of contents.

</div>

To prevent headings inside demo blocks or decorative sections from appearing in the table of contents, wrap them in a `<div data-toc-ignore>` element:

```html
<div data-toc-ignore>## This heading won't appear in the ToC</div>
```

## Links

```
[Inline link](https://example.com)
[Link with title](https://example.com "Hover tooltip")
[Other documentation pages](/docs/getting-started)
<https://example.com> (autolink)
```

Create [inline links](https://example.com) to external sites. Link to [other documentation pages](/docs/getting-started) using relative paths. The URL structure follows the file structure with numbered prefixes removed. Bare URLs like <https://example.com> are also automatically linked.

## Code Blocks

Code blocks support syntax highlighting through file extension hints:

```js
function greet(name) {
  return `Hello, ${name}!`;
}

const message = greet("World");
console.log(message);
```

Python syntax highlighting:

```python
def calculate_sum(numbers):
    total = sum(numbers)
    return total

result = calculate_sum([1, 2, 3, 4, 5])
print(f"The sum is: {result}")
```

Shell commands:

```bash
cd project-directory
npm install
npm run dev
```

Plain text without highlighting:

```
This is plain text
No syntax highlighting applied
Useful for output or notes
```

## Blockquotes

```
> Blockquotes call out important information.
>
> They can span multiple paragraphs.
```

> Blockquotes provide a way to call out important information or cite external sources. They appear with a left border and distinct styling to separate them from regular content.
>
> Blockquotes can span multiple paragraphs. Each paragraph maintains the quote styling while remaining readable and distinct from surrounding text.

## Lists

Ordered lists number items sequentially:

```
1. First item in the sequence
2. Second item follows naturally
3. Third item continues the pattern
```

1. First item in the sequence
2. Second item follows naturally
3. Third item continues the pattern

Unordered lists use bullet points:

```
- First bullet point
- Second bullet point
- Third bullet point
```

- First bullet point
- Second bullet point
- Third bullet point

Nested lists combine both styles:

```
1. Top level ordered item
   - Nested unordered item
   - Another nested item
2. Second top level item
   - Nested item here
     1. Deeply nested ordered
     2. Another deep item
```

1. Top level ordered item
   - Nested unordered item
   - Another nested item
2. Second top level item
   - Nested item here
     1. Deeply nested ordered
     2. Another deep item

## Task Lists

Task lists (GFM) render checkboxes:

```
- [x] Completed task
- [ ] Incomplete task
- [ ] Another pending item
```

- [x] Completed task
- [ ] Incomplete task
- [ ] Another pending item

## Horizontal Rules

Horizontal rules create visual breaks between sections:

---

Content continues after the break with clear separation from what came before.

## Tables

```
| Feature    | Description              | Status   |
| ---------- | ------------------------ | -------- |
| Left align | Default column alignment | Done     |
| :---       | Left-aligned column      |          |
| ---:       | Right-aligned column     |          |
| :---:      | Center-aligned column    |          |
```

Tables organize structured data into rows and columns:

| Feature             | Description                  | Status   |
| ------------------- | ---------------------------- | -------- |
| Markdown parsing    | Convert markdown to HTML     | Complete |
| Syntax highlighting | Code blocks with colors      | Complete |
| Table of contents   | Auto-generated from headings | Complete |
| Mobile navigation   | Responsive dropdown menus    | Complete |

Tables support inline formatting like **bold**, _italic_, and `code` within cells.

## Images

```
![Alt text](https://example.com/image.png)
![Alt text](https://example.com/image.png "Optional title")
![Local image](../../assets/my-image.png)
```

Images display with automatic sizing:

![Placeholder image description](https://via.placeholder.com/800x400/eeeae5/3a3a3a?text=Image+Example)

Alt text provides accessibility and appears when images fail to load. Link to a page or full-size version by wrapping the image in a link:

```
[![Alt text](image.png)](https://example.com)
```

## Video

Markdown does not have native video support. To embed a video use an HTML `<video>` tag for self-hosted files or an `<iframe>` for YouTube/Vimeo:

```html
<!-- Self-hosted video -->
<video controls width="100%">
  <source src="/assets/demo.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>

<!-- YouTube embed -->
<iframe
  width="100%"
  height="400"
  src="https://www.youtube.com/embed/VIDEO_ID"
  title="Video title"
  frameborder="0"
  allowfullscreen
></iframe>
```

## Inline HTML

When markdown syntax isn't sufficient, inline HTML provides additional control:

<div style="padding: 1rem; background: #eeeae5; border-radius: 0.5rem; margin: 1.5rem 0;">
  <strong>Custom HTML Block</strong>
  <p>This section uses HTML instead of markdown for precise styling control.</p>
</div>

## Alerts

Alerts are an extension of standard blockquote syntax provided by [remark-github-blockquote-alert](https://github.com/jaywcjlove/remark-github-blockquote-alert). Five types are supported: `NOTE`, `TIP`, `IMPORTANT`, `WARNING`, and `CAUTION`.

```
> [!NOTE]
> Useful information that users should know.

> [!TIP]
> Helpful advice for doing things better.

> [!IMPORTANT]
> Key information users need to accomplish their goal.

> [!WARNING]
> Urgent info that needs immediate user attention.

> [!CAUTION]
> Advises about risks or negative outcomes.
```

> [!NOTE]
> Useful information that users should know.

> [!TIP]
> Helpful advice for doing things better.

> [!IMPORTANT]
> Key information users need to accomplish their goal.

> [!WARNING]
> Urgent info that needs immediate user attention.

> [!CAUTION]
> Advises about risks or negative outcomes.

## Tabbed Code Blocks

Group related code blocks into a tabbed interface using the `:::code-tabs` container directive. The label for each tab is taken from the **meta string** — the text written after the language identifier on the opening fence.

````
:::code-tabs
```bash npm
npm install
```
```bash pnpm
pnpm install
```
```bash yarn
yarn install
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

```bash yarn
yarn install
```

:::

Any language can be used inside the tabs:

:::code-tabs

```ts TypeScript
const greet = (name: string): string => `Hello, ${name}!`;
```

```js JavaScript
const greet = (name) => `Hello, ${name}!`;
```

:::

## Details & Summary

The native HTML `<details>` and `<summary>` elements create collapsible sections. Standard markdown is supported inside:

```html
<details>
  <summary>Click to expand</summary>

  Hidden content goes here. You can use **markdown** inside.
</details>
```

<details>
<summary>Click to expand</summary>

Hidden content goes here. You can use **markdown** inside, including:

- Bullet lists
- `inline code`
- And more

</details>

<details>
<summary>Advanced configuration example</summary>

```ts
export default defineConfig({
  markdown: {
    remarkPlugins: [remarkAlert, remarkDirective, remarkCodeTabs],
  },
});
```

</details>

## Combinations

All elements work together naturally. Here's a **bold statement** with an `inline code reference` followed by a [link to external docs](https://docs.astro.build). The text flows naturally and maintains readability.

Complex combinations like this preserve formatting: **_bold italic text_** containing `code snippets` and [embedded links](/) all within the same sentence.
