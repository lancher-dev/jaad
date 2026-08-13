import { test } from "node:test";
import assert from "node:assert/strict";
import {
  resolveConfig,
  defineJaadConfig,
} from "../../packages/jaad/src/config.ts";

// Resolved outside a repository, so nothing is inferred and the defaults show.
const bare = (over = {}) => resolveConfig({ title: "T", ...over }, "/");

test("title is the only thing you must supply", () => {
  const config = bare();
  assert.equal(config.title, "T");
  assert.equal(config.docsDir, "./docs");
  assert.equal(config.routeBase, "/docs");
  assert.equal(config.lang, "en");
  assert.deepEqual(config.nav, []);
  assert.deepEqual(config.social, {});
});

test("a missing title is rejected rather than defaulted", () => {
  assert.throws(() => resolveConfig({} as never, "/"));
});

test("an explicit edit link is used verbatim", () => {
  assert.equal(
    bare({ editLink: "https://git.example.dev/r/edit/main/docs/:path" })
      .editBase,
    "https://git.example.dev/r/edit/main/docs/:path",
  );
});

test("edit link and repository degrade to null outside a repository", () => {
  const config = bare();
  assert.equal(config.editBase, null);
  assert.equal(config.repoUrl, null);
});

test("editLink false disables it even inside a repository", () => {
  assert.equal(resolveConfig({ title: "T", editLink: false }).editBase, null);
});

test("the shorthand and full theme forms both parse", () => {
  assert.equal(bare({ theme: "dracula" }).theme, "dracula");
  assert.deepEqual(bare({ theme: { light: "a", dark: "b" } }).theme, {
    light: "a",
    dark: "b",
  });
});

test("social accepts a bare url or a full entry", () => {
  const { social } = bare({
    social: {
      github: "https://github.com/o/r",
      forum: { href: "https://f.dev", label: "Forum", svg: "<svg/>" },
    },
  });
  assert.equal(social.github, "https://github.com/o/r");
  assert.deepEqual(social.forum, {
    href: "https://f.dev",
    label: "Forum",
    svg: "<svg/>",
  });
});

test("defineJaadConfig hands back exactly what it was given", () => {
  const options = { title: "X" };
  assert.equal(defineJaadConfig(options), options);
});

// A back-reference in an integration used to throw during serialisation.
test("astro's own options never reach the resolved config", () => {
  const integration = { name: "x", hooks: {} } as Record<string, unknown>;
  integration.self = integration;

  const config = bare({
    site: "https://a.dev",
    base: "/x",
    astro: { integrations: [integration] },
  });

  assert.deepEqual(
    Object.keys(config).filter((k) => ["site", "base", "astro"].includes(k)),
    [],
  );
  assert.doesNotThrow(() => JSON.stringify(config));
});

// ── The mount point, which every internal link is built from ─────────────────

test("the mount point gets one leading slash and no trailing one", () => {
  const at = (routeBase: string) => bare({ routeBase }).docsBase;
  assert.equal(at("/docs"), "/docs");
  assert.equal(at("docs"), "/docs", "a missing slash made every link relative");
  assert.equal(at("/docs/"), "/docs");
  assert.equal(at("/manual/guide"), "/manual/guide");
});

test("the root mount point is empty, so links stay single-slashed", () => {
  assert.equal(bare({ routeBase: "/" }).docsBase, "");
});

test("a logo has to be a public url, not a source path", () => {
  assert.equal(bare({ logo: "/logo.svg" }).logo, "/logo.svg");
  assert.equal(
    bare({ logo: "https://cdn.dev/l.svg" }).logo,
    "https://cdn.dev/l.svg",
  );
  assert.throws(() => bare({ logo: "./src/logo.svg" }), /public url/);
});
