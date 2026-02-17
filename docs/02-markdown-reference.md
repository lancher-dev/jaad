# Markdown Reference

This page demonstrates all available markdown syntax and styling options in JAAD.

## Text Formatting

Regular paragraph text appears in the default body font. **Bold text** uses a heavier weight for emphasis. _Italic text_ provides subtle emphasis with a slanted style. You can combine **_bold and italic_** together for stronger emphasis.

Inline `code` appears with a distinct monospace font and background, useful for function names, variables, or short commands.

## Headings

# Heading Level 1

Heading level one typically serves as the page title. Only use one per document.

## Heading Level 2

Level two headings create major sections and appear in the table of contents with a subtle underline.

### Heading Level 3

Level three headings create subsections and also appear in the table of contents.

#### Heading Level 4

Level four headings provide additional hierarchy without appearing in the table of contents.

## Links

Create [inline links](https://example.com) to external sites. Link to [other documentation pages](/docs/getting-started) using relative paths. The URL structure follows the file structure with numbered prefixes removed.

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

> Blockquotes provide a way to call out important information or cite external sources. They appear with a left border and distinct styling to separate them from regular content.
>
> Blockquotes can span multiple paragraphs. Each paragraph maintains the quote styling while remaining readable and distinct from surrounding text.

## Lists

Ordered lists number items sequentially:

1. First item in the sequence
2. Second item follows naturally
3. Third item continues the pattern
4. Additional items maintain numbering

Unordered lists use bullet points:

- First bullet point
- Second bullet point
- Third bullet point
- Additional points as needed

Nested lists combine both styles:

1. Top level ordered item
   - Nested unordered item
   - Another nested item
2. Second top level item
   - Nested item here
     1. Deeply nested ordered
     2. Another deep item

## Horizontal Rules

Horizontal rules create visual breaks between sections:

---

Content continues after the break with clear separation from what came before.

## Tables

Tables organize structured data into rows and columns:

| Feature             | Description                  | Status   |
| ------------------- | ---------------------------- | -------- |
| Markdown parsing    | Convert markdown to HTML     | Complete |
| Syntax highlighting | Code blocks with colors      | Complete |
| Table of contents   | Auto-generated from headings | Complete |
| Mobile navigation   | Responsive dropdown menus    | Complete |

Tables support inline formatting like **bold**, _italic_, and `code` within cells.

## Images

Images display with automatic sizing and can be clicked to view full size:

![Placeholder image description](https://via.placeholder.com/800x400/eeeae5/3a3a3a?text=Image+Example)

Alt text provides accessibility and appears when images fail to load.

## Inline HTML

When markdown syntax isn't sufficient, inline HTML provides additional control:

<div style="padding: 1rem; background: #eeeae5; border-radius: 0.5rem; margin: 1.5rem 0;">
  <strong>Custom HTML Block</strong>
  <p>This section uses HTML instead of markdown for precise styling control.</p>
</div>

## Combinations

All elements work together naturally. Here's a **bold statement** with an `inline code reference` followed by a [link to external docs](https://docs.astro.build). The text flows naturally and maintains readability.

Complex combinations like this preserve formatting: **_bold italic text_** containing `code snippets` and [embedded links](/) all within the same sentence.
