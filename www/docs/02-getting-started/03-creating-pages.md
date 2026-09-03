# Creating pages

Create a markdown file in `docs/` with a numbered prefix. The number controls the order in the sidebar; it is stripped from the URL.

```
docs/
  01-introduction.md   → /
  02-guide.md          → /guide
  03-advanced/         → sidebar section "Advanced"
    01-config.md       → /advanced/config
    02-plugins.md      → /advanced/plugins
```

The first `# Heading` in each file becomes the page title. `##` and `###` headings appear automatically in the table of contents.

## The opening page

Whichever file sorts first is the opening page at `routeBase`, which is `/` by
default. Its browser title is the site name alone, and its named slug redirects
to the opening route. With `routeBase: "/docs"`, for example,
`01-introduction.md` opens at `/docs` and `/docs/introduction` redirects there.
