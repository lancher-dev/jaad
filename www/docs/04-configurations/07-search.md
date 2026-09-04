# Search

Readers can open search from the header or with `Ctrl+K` (`⌘K` on macOS).
Results support arrow-key selection, `Enter` to open and `Escape` to close.

The build includes every Markdown page and indexes its:

- title;
- parent chapter;
- body text, excluding code blocks, images and directives.

The index is emitted at `<routeBase>/search-index.json`, loaded on first use
and cached for the session. It requires no configuration.

The single-file index suits documentation with up to a few hundred pages. For
larger collections, use a dedicated search service.
