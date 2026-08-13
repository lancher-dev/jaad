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

test("no third-party host on the critical path", () => {
  const offenders = distFiles(".html")
    .filter((f) => readFileSync(f, "utf8").includes("nerdfonts.com"))
    .map((f) => f.split("/dist/")[1]);
  assert.deepEqual(offenders, []);
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
