import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { page, distFiles } from "../dist.mjs";

// jaamd only warns when it cannot register its remark plugins, so a green build
// says nothing about whether they ran.
test("jaamd alerts reach the built HTML", () => {
  assert.match(page("docs/markdown/alerts/index.html"), /markdown-alert/);
});

test("jaamd code-tabs reach the built HTML", () => {
  assert.match(page("docs/markdown/code-blocks/index.html"), /code-tabs/);
});

test("dual-theme code colours reach the built CSS", () => {
  const css = distFiles(".css")
    .map((f) => readFileSync(f, "utf8"))
    .join("\n");
  assert.ok(
    css.includes("var(--shiki-light)") && css.includes("var(--shiki-dark)"),
    "shiki-dual.css did not ship; code blocks would render uncoloured",
  );
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
