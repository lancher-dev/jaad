# Search

Readers can open search from the header or with `Ctrl+K` (`⌘K` on macOS).
Results support arrow-key selection, `Enter` to open and `Escape` to close.

The build includes every Markdown page and indexes its:

- title;
- parent chapter;
- body text, excluding code blocks, images and directives.

The index is emitted at `<routeBase>/search-index.json`, loaded on first use
and cached for the session. It requires no configuration.

The index is a single file containing the searchable text, so its size grows
with the documentation.
