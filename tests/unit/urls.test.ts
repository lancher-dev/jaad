import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normaliseBasePath,
  withDeploymentBase,
  docsPageHref,
  docsMarkdownHref,
} from "../../packages/jaad/src/urls.ts";

test("base paths are normalised without a trailing slash", () => {
  assert.equal(normaliseBasePath("/"), "");
  assert.equal(normaliseBasePath("repo/"), "/repo");
  assert.equal(normaliseBasePath("/repo/docs/"), "/repo/docs");
});

test("a deployment base prefixes only root-relative urls", () => {
  assert.equal(withDeploymentBase("/", "/repo/"), "/repo/");
  assert.equal(withDeploymentBase("/guide", "/repo/"), "/repo/guide");
  assert.equal(withDeploymentBase("/repo/guide", "/repo/"), "/repo/repo/guide");
  assert.equal(
    withDeploymentBase("https://example.dev/a", "/repo/"),
    "https://example.dev/a",
  );
  assert.equal(
    withDeploymentBase("//cdn.example.dev/a", "/repo/"),
    "//cdn.example.dev/a",
  );
  assert.equal(withDeploymentBase("#section", "/repo/"), "#section");
});

test("the opening doc uses the mount point while markdown keeps its slug", () => {
  assert.equal(
    docsPageHref("", { docsBase: "", deploymentBase: "/repo" }),
    "/repo/",
  );
  assert.equal(
    docsPageHref("", { docsBase: "/docs", deploymentBase: "/repo" }),
    "/repo/docs",
  );
  assert.equal(
    docsPageHref("guide", {
      docsBase: "/docs",
      deploymentBase: "/repo",
    }),
    "/repo/docs/guide",
  );
  assert.equal(
    docsMarkdownHref("introduction", {
      docsBase: "/docs",
      deploymentBase: "/repo",
    }),
    "/repo/docs/introduction.md",
  );
});

// ── Locale segment ───────────────────────────────────────────────────────────

test("the default locale keeps the urls it had before i18n", () => {
  const urls = { docsBase: "/docs", locale: "en", defaultLocale: "en" };
  assert.equal(docsPageHref("guide", urls), "/docs/guide");
  assert.equal(docsPageHref("", urls), "/docs");
  assert.equal(docsMarkdownHref("guide", urls), "/docs/guide.md");
});

test("every other locale prefixes the slug", () => {
  const urls = { docsBase: "/docs", locale: "it", defaultLocale: "en" };
  assert.equal(docsPageHref("guida", urls), "/docs/it/guida");
  assert.equal(docsPageHref("", urls), "/docs/it");
  assert.equal(docsMarkdownHref("guida", urls), "/docs/it/guida.md");
});

test("a locale at the site root still resolves the opening page", () => {
  assert.equal(
    docsPageHref("", { docsBase: "", locale: "it", defaultLocale: "en" }),
    "/it",
  );
  assert.equal(
    docsPageHref("", { docsBase: "", locale: "en", defaultLocale: "en" }),
    "/",
  );
});

// withDeploymentBase is not idempotent, so the locale goes in before it.
test("the deployment base wraps the locale, and only once", () => {
  assert.equal(
    docsPageHref("guida", {
      docsBase: "/docs",
      deploymentBase: "/repo",
      locale: "it",
      defaultLocale: "en",
    }),
    "/repo/docs/it/guida",
  );
});
