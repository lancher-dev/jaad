import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { page, distFiles } from "../dist.mjs";

const meta = (html, key) =>
  html.match(
    new RegExp(`<meta (?:property|name)="${key}" content="([^"]*)"`),
  )?.[1] ?? null;

// Facebook, LinkedIn and Slack do not resolve relative image paths: a relative
// og:image means no preview anywhere.
test("social card images are absolute urls", () => {
  for (const file of distFiles(".html")) {
    const html = readFileSync(file, "utf8");
    for (const key of ["og:image", "twitter:image"]) {
      const value = meta(html, key);
      if (value === null) continue;
      assert.match(value, /^https?:\/\//, `${key} in ${file}`);
    }
  }
});

test("pages carry site name and locale", () => {
  const html = page("docs/index.html");
  assert.ok(meta(html, "og:site_name"));
  assert.ok(meta(html, "og:locale"));
});

test("a page description is not just its own title", () => {
  for (const path of ["docs/index.html", "docs/markdown/tables/index.html"]) {
    const html = page(path);
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
    const description = meta(html, "og:description") ?? "";
    assert.notEqual(
      description.toLowerCase(),
      title.split("|")[0].trim().toLowerCase(),
      `${path} describes itself with its own title`,
    );
    assert.ok(description.length > 0, `${path} has no description`);
  }
});

test("every page declares a language", () => {
  for (const file of distFiles(".html")) {
    const html = readFileSync(file, "utf8");
    if (/<meta http-equiv="refresh"/.test(html)) continue;
    assert.match(html, /<html lang="[^"]+"/, file);
  }
});

test("docs pages carry parseable structured data with absolute urls", () => {
  const html = page("docs/markdown/tables/index.html");
  const block = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
  );
  assert.ok(block, "no JSON-LD on a docs page");

  const data = JSON.parse(block[1]);
  assert.equal(data["@type"], "TechArticle");
  assert.ok(data.headline);

  const crumbs = data.breadcrumb.itemListElement;
  assert.ok(crumbs.length >= 2, "breadcrumb has no trail");
  for (const crumb of crumbs) {
    if (crumb.item) assert.match(crumb.item, /^https?:\/\//, crumb.name);
  }
});

test("the opening page redirect is not listed as canonical content", () => {
  const sitemap = distFiles(".xml")
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");
  assert.doesNotMatch(sitemap, /\/docs\/overview\/?<\/loc>/);
});
