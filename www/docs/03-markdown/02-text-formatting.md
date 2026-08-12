# Text Formatting

## Commons

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

## Horizontal Rules

Horizontal rules create visual breaks between sections:

```
---
```

---

Content continues after the break with clear separation from what came before.
