# Creating pages

Create a markdown file in `docs/` with a numbered prefix. The number controls the order in the sidebar; it is stripped from the URL.

```
docs/
  01-introduction.md   → /docs/introduction
  02-guide.md          → /docs/guide
  03-advanced/         → sidebar section "Advanced"
    01-config.md       → /docs/advanced/config
    02-plugins.md      → /docs/advanced/plugins
```

The first `# Heading` in each file becomes the page title. `##` and `###` headings appear automatically in the table of contents.
