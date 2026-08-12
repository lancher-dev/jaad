import { test } from "node:test";
import assert from "node:assert/strict";
import {
  scoreItems,
  getSnippet,
  splitOnMatches,
  type SearchItem,
} from "../../packages/jaad/src/utils/search.ts";

const item = (over: Partial<SearchItem>): SearchItem => ({
  title: "Title",
  slug: "slug",
  chapter: null,
  body: "body",
  ...over,
});

test("a title match outranks a body match", () => {
  const index = [
    item({ title: "Deployment", slug: "a", body: "nothing here" }),
    item({ title: "Nothing", slug: "b", body: "talks about deployment" }),
  ];
  assert.deepEqual(
    scoreItems(index, "deployment").map((i) => i.slug),
    ["a", "b"],
  );
});

test("an exact prefix outranks a match in the middle", () => {
  const index = [
    item({ title: "Advanced tables", slug: "a" }),
    item({ title: "Tables", slug: "b" }),
  ];
  assert.equal(scoreItems(index, "tables")[0].slug, "b");
});

test("items matching nothing are dropped", () => {
  const index = [item({ title: "Alpha", slug: "a", body: "x" })];
  assert.deepEqual(scoreItems(index, "zzz"), []);
});

test("an empty query previews the first entries", () => {
  const index = Array.from({ length: 20 }, (_, i) => item({ slug: String(i) }));
  assert.equal(scoreItems(index, "").length, 8);
  assert.equal(scoreItems(index, "   ").length, 8);
});

test("results are capped at ten", () => {
  const index = Array.from({ length: 40 }, (_, i) =>
    item({ title: "Match", slug: String(i) }),
  );
  assert.equal(scoreItems(index, "match").length, 10);
});

test("a snippet is ellipsised only where it was cut", () => {
  const body = "x".repeat(200) + " needle " + "y".repeat(200);
  const snippet = getSnippet(body, "needle");
  assert.ok(snippet.startsWith("..."));
  assert.ok(snippet.endsWith("..."));
  assert.ok(snippet.includes("needle"));

  assert.ok(!getSnippet("needle in front", "needle").startsWith("..."));
});

test("no snippet when the query is absent or empty", () => {
  assert.equal(getSnippet("some body", "absent"), "");
  assert.equal(getSnippet("some body", "  "), "");
});

test("matches are split case-insensitively", () => {
  assert.deepEqual(splitOnMatches("Foo bar FOO", "foo"), [
    { text: "Foo", match: true },
    { text: " bar ", match: false },
    { text: "FOO", match: true },
  ]);
});

test("regex metacharacters in the query are literal", () => {
  assert.deepEqual(splitOnMatches("a.b and axb", "a.b"), [
    { text: "a.b", match: true },
    { text: " and axb", match: false },
  ]);
  assert.doesNotThrow(() => splitOnMatches("c++ code", "c++"));
  assert.equal(
    splitOnMatches("c++ code", "c++").filter((p) => p.match).length,
    1,
  );
});
