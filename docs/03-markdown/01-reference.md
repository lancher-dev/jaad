# Markdown Reference

The following pages demonstrate all available markdown syntax and styling options in JAAD. JAAD supports [CommonMark](https://commonmark.org/help/) and [GitHub Flavored Markdown (GFM)](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax) — refer to those references for the full specification.

## JAAMD

Markdown rendering in JAAD is powered by **[JAAMD](https://github.com/lancher-dev/jaamd)** (_Just Another Astro Markdown_), a standalone Astro integration that bundles remark plugins, client-side enhancements, and styling into a single cohesive package.

It includes remark plugins such as `remark-alert`, which enables GitHub-style blockquote alerts (`> [!NOTE]`, `> [!WARNING]`, …), and `remark-code-tabs`, which adds support for `:::code-tabs` directive blocks. JAAMD also provides a `markdown.css` stylesheet that is automatically injected and scoped to the `.jaamd-content` class, ensuring styles remain isolated from the rest of the application.

On the client side, it enhances the reading experience with features like copy buttons on code blocks, an image lightbox, anchor links on headings, animated `<details>` elements, and spoiler reveal behavior.

JAAD installs JAAMD as a dependency and configures it automatically, so no additional setup is required. Markdown content is wrapped with the `MarkdownContent` component, which applies the `jaamd-content` class targeted by both the stylesheet and the JavaScript enhancements.

For a complete list of theming tokens exposed by JAAMD, refer to the [Styles](/docs/configurations/styles) and [Fonts](/docs/configurations/fonts) pages in the documentation.
