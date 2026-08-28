import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { page, distFiles, allCss } from "../dist.mjs";

test("jaamd alerts reach the built HTML", () => {
  assert.match(page("docs/markdown/alerts/index.html"), /markdown-alert/);
});

test("jaamd code-tabs reach the built HTML", () => {
  assert.match(page("docs/markdown/code-blocks/index.html"), /code-tabs/);
});

test("dual-theme code colours reach the built CSS", () => {
  const css = allCss();
  assert.ok(
    css.includes("var(--shiki-light)") && css.includes("var(--shiki-dark)"),
    "shiki-dual.css did not ship; code blocks would render uncoloured",
  );
});

// The 404 route used to hardcode the framework's own name.
test("no page title names the framework instead of the site", () => {
  const offenders = distFiles(".html")
    .map((f) => [f.split("/dist/")[1], readFileSync(f, "utf8")])
    .filter(([, html]) => /<title>[^<]*\bJAAD\b[^<]*\bJAAD\b/.test(html))
    .map(([name]) => name);
  assert.deepEqual(offenders, []);
  assert.match(page("404.html"), /<title>404 \| JAAD<\/title>/);
});

// Fonts are shipped with the package
const HOSTS = ["nerdfonts.com", "fonts.googleapis.com", "fonts.gstatic.com"];

test("no third-party host on the critical path", () => {
  const offenders = distFiles(".html")
    .flatMap((f) => {
      const html = readFileSync(f, "utf8");
      return HOSTS.filter((h) => html.includes(h)).map(
        (h) => `${f.split("/dist/")[1]}: ${h}`,
      );
    })
    .sort();
  assert.deepEqual(offenders, []);
});

test("the fonts are served from the site itself", () => {
  const faces = page("index.html").match(/@font-face\{[^}]*\}/g) ?? [];
  const withFile = faces.filter((f) => f.includes("url("));
  assert.ok(withFile.length > 0, "no font-face carries a file");
  for (const face of withFile) {
    assert.match(face, /url\("?\/[^")]*\.woff2/, "font is not self-hosted");
  }
});

// www sets no `footer`, which is the bare default: the credit on its own.
test("an unset footer renders the credit, not its placeholder", () => {
  const footer = page("index.html").match(/<footer[\s\S]*?<\/footer>/)?.[0];
  assert.ok(footer, "no footer in the built page");
  assert.match(footer, /jaad\.lancher\.dev/);
  assert.doesNotMatch(footer, /:credit/, ":credit reached the page unexpanded");
});

test("every docs page carries its search index and llms entry", () => {
  const index = JSON.parse(page("search-index.json"));
  assert.ok(index.length > 0, "search index is empty");
  assert.match(page("llms.txt"), /^# /);
});

test("the sidebar follows the numeric prefixes", () => {
  const links = [
    ...page("docs/index.html").matchAll(/href="(\/docs\/[^"#]*)"/g),
  ].map((m) => m[1]);

  const first = links.indexOf("/docs/overview");
  assert.equal(first, 0, "00-overview should lead");
  assert.ok(
    links.indexOf("/docs/getting-started/installation") <
      links.indexOf("/docs/markdown/reference"),
    "chapter 02 must come before chapter 03",
  );
  assert.ok(
    links.indexOf("/docs/getting-started/installation") <
      links.indexOf("/docs/getting-started/deployment"),
    "files inside a chapter must follow their own numbers",
  );
});

// The header used to be 50rem over 56rem of content, so its right edge fell
// inside the text it sat above.
test("the chrome is measured against the content, not against a second number", () => {
  const css = allCss().replace(/\s+/g, "");

  assert.match(
    css,
    /--jaad-chrome-width:var\(--jaad-content-width\)/,
    "the chrome width is no longer derived from the content width",
  );
  assert.match(css, /\.jaad-chrome\{[^}]*max-width:var\(--jaad-chrome-width\)/);
  assert.match(css, /\.docs-main\{[^}]*max-width:var\(--jaad-content-width\)/);
  assert.ok(
    !css.includes("max-width:50rem"),
    "a hardcoded chrome width is back",
  );

  assert.match(
    page("docs/index.html"),
    /<header[^>]*class="[^"]*jaad-chrome/,
    "the header does not use the shared measure",
  );
});
