import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { page, distFiles, allCss } from "../dist.mjs";

test("jaamd's remark plugins ran", () => {
  const markdown = page("docs/markdown/index.html");
  assert.match(markdown, /markdown-alert/);
  assert.match(markdown, /code-tabs/);
});

test("retired documentation routes redirect to their replacements", () => {
  const markdownPages = [
    "alerts",
    "blockquotes",
    "code-blocks",
    "combination",
    "detail--summary",
    "images--videos",
    "inner-html",
    "links",
    "lists",
    "reference",
    "spoiler",
    "tables",
    "text-formatting",
  ];

  for (const slug of markdownPages) {
    assert.match(
      page(`docs/markdown/${slug}/index.html`),
      /url=\/docs\/markdown["']?/,
      slug,
    );
  }

  assert.match(
    page("docs/getting-started/development/index.html"),
    /url=\/docs\/getting-started\/installation#run-locally/,
  );
});

test("dual-theme code colours reach the built CSS", () => {
  const css = allCss();
  assert.ok(
    css.includes("var(--shiki-light)") && css.includes("var(--shiki-dark)"),
    "shiki-dual.css did not ship; code blocks would render uncoloured",
  );
});

test("no page title names the framework instead of the site", () => {
  const offenders = distFiles(".html")
    .map((f) => [f.split("/dist/")[1], readFileSync(f, "utf8")])
    .filter(([, html]) => /<title>[^<]*\bJAAD\b[^<]*\bJAAD\b/.test(html))
    .map(([name]) => name);
  assert.deepEqual(offenders, []);
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
  const faces = page("docs/index.html").match(/@font-face\{[^}]*\}/g) ?? [];
  const withFile = faces.filter((f) => f.includes("url("));
  assert.ok(withFile.length > 0, "no font-face carries a file");
  for (const face of withFile) {
    assert.match(face, /url\("?\/[^")]*\.woff2/, "font is not self-hosted");
  }
});

test("the inferred repository is a single icon, with no menu to repeat it", () => {
  const home = page("docs/index.html");
  const match = home.match(/href="(https:\/\/github\.com\/[\w-]+\/[\w-]+)"/);
  assert.ok(match, "no repository link was rendered at all");
  const repo = match[1];

  assert.equal(
    home.split(`href="${repo}"`).length - 1,
    1,
    "the repository link is listed twice",
  );
  assert.doesNotMatch(home, /<jaad-nav-mobile/, "an empty mobile menu shipped");
});

// The docs config sets no `footer`, so the credit appears on its own.
test("an unset footer renders the credit, not its placeholder", () => {
  const footer = page("docs/index.html").match(
    /<footer[\s\S]*?<\/footer>/,
  )?.[0];
  assert.ok(footer, "no footer in the built page");
  assert.match(footer, /jaad\.lancher\.dev/);
  assert.doesNotMatch(footer, /:credit/, ":credit reached the page unexpanded");
});

test("every docs page carries its search index and llms entry", () => {
  const index = JSON.parse(page("docs/search-index.json"));
  assert.ok(index.length > 0, "search index is empty");
  assert.match(page("docs/llms.txt"), /^# /);
});

test("the sidebar follows the numeric prefixes", () => {
  const links = [
    ...page("docs/index.html").matchAll(/href="(\/docs(?:\/[^"#]*)?)"/g),
  ].map((m) => m[1]);

  const at = (href) => {
    const index = links.indexOf(href);
    assert.notEqual(index, -1, `${href} is missing from the sidebar`);
    return index;
  };

  assert.equal(links[0], "/docs", "the opening page should own routeBase");
  assert.ok(
    at("/docs/getting-started/installation") < at("/docs/markdown"),
    "getting started must come before markdown",
  );
  assert.ok(
    at("/docs/getting-started/installation") <
      at("/docs/getting-started/deployment"),
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

  // The gutters used to be lg:ml-64/lg:mr-64, so widening the sidebar token
  // moved the sidebars without moving the room reserved for them.
  assert.match(
    css,
    /\.docs-main-gutters\{margin-inline:var\(--jaad-sidebar-width\)\}/,
    "the content gutters no longer follow the sidebar token",
  );
  assert.match(
    css,
    /\.docs-sidebar-left\{left:max\(1rem,var\(--jaad-sidebar-offset\)\)\}/,
    "a widened sidebar can be pushed off screen again",
  );

  assert.match(
    page("docs/index.html"),
    /<header[^>]*class="[^"]*jaad-chrome/,
    "the header does not use the shared measure",
  );
  assert.match(page("docs/index.html"), /data-jaad-default-frame/);
});

// With routeBase set, JAAD injects no 404: the site has to bring its own.
test("the site answers a wrong url with its own page", () => {
  const missing = page("404.html");
  assert.match(missing, /<title>404 \| JAAD<\/title>/);
  assert.match(missing, /<body[^>]*data-site-layout/);
  assert.match(missing, /href="\/docs"/, "no way back into the documentation");
});

test("the landing page shares the docs measure without using its frame", () => {
  const home = page("index.html");
  const css = allCss().replace(/\s+/g, "");

  assert.match(home, /<body[^>]*data-site-layout/);
  assert.doesNotMatch(home, /jaad-chrome|data-jaad-default-frame/);
  assert.match(
    css,
    /\.site-chrome\{[^}]*max-width:var\(--site-content-width\)/,
  );
  assert.match(css, /\.site-main\{[^}]*max-width:var\(--site-content-width\)/);
  assert.match(home, /<site-theme-toggle>/);
});

test("docs and the page layout share one padding token", () => {
  const css = allCss().replace(/\s+/g, "");

  for (const rule of [".jaad-main", ".docs-page-main"]) {
    assert.match(
      css,
      new RegExp(
        `\\${rule}\\{[^}]*padding-inline:var\\(--jaad-page-padding\\)`,
      ),
      `${rule} does not read the padding token`,
    );
  }

  // The page nav takes its width from the main it sits in, not its own number.
  const nav = page("docs/getting-started/installation/index.html")
    .match(/<nav[^>]*>/g)
    ?.find((tag) => tag.includes('aria-label="Page navigation"'));

  assert.ok(nav, "the page navigation is missing from the built page");
  assert.doesNotMatch(
    nav,
    /max-w-/,
    "the page nav pins itself to an absolute width again",
  );
});
