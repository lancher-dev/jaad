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
