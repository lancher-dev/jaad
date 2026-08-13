import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSocialLinks } from "../../packages/jaad/src/social.ts";
import type { JaadResolvedConfig } from "../../packages/jaad/src/config.ts";

const config = (over: Partial<JaadResolvedConfig>) =>
  ({ social: {}, repoUrl: null, ...over }) as JaadResolvedConfig;

test("a known key gets the forge label and icon", () => {
  const [link] = buildSocialLinks(
    config({ social: { github: "https://github.com/o/r" } }),
  );
  assert.equal(link.label, "GitHub");
  assert.ok(link.path);
});

test("an unknown key falls back to itself, with the supplied svg", () => {
  const [link] = buildSocialLinks(
    config({
      social: { discord: { href: "https://discord.gg/x", svg: "<svg/>" } },
    }),
  );
  assert.equal(link.label, "discord");
  assert.equal(link.svg, "<svg/>");
  assert.equal(link.path, undefined);
});

test("an explicit label wins over the forge name", () => {
  const [link] = buildSocialLinks(
    config({
      social: { github: { href: "https://github.com/o/r", label: "Source" } },
    }),
  );
  assert.equal(link.label, "Source");
});

test("the inferred repository is appended when it is not already listed", () => {
  const links = buildSocialLinks(
    config({
      social: { gitlab: "https://gitlab.com/o/r" },
      repoUrl: "https://github.com/o/r",
    }),
  );
  assert.deepEqual(
    links.map((l) => l.label),
    ["GitLab", "GitHub"],
  );
});

// The mobile menu used to list the repository twice: once from `social`, once
// from the git remote.
test("the inferred repository is not repeated when the user listed it", () => {
  const links = buildSocialLinks(
    config({
      social: { github: "https://github.com/o/r" },
      repoUrl: "https://github.com/o/r",
    }),
  );
  assert.equal(links.length, 1);
});

test("an unrecognised remote still gets a link, without an icon", () => {
  const [link] = buildSocialLinks(
    config({ repoUrl: "https://git.example.dev/o/r" }),
  );
  assert.equal(link.label, "Repository");
  assert.equal(link.path, undefined);
});
