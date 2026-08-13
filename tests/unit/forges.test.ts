import { test } from "node:test";
import assert from "node:assert/strict";
import { FORGES, forgeForUrl } from "../../packages/jaad/src/forges.ts";

test("the bundled set covers the forges the git inference can meet", () => {
  for (const name of ["github", "gitlab", "codeberg", "gitea", "forgejo"]) {
    assert.ok(FORGES[name], `${name} missing`);
    assert.match(FORGES[name].path, /^[Mm]/, `${name} has no usable path`);
  }
});

// A malformed path draws nothing and fails silently in the browser.
test("every icon path is made of real svg commands", () => {
  for (const [name, forge] of Object.entries(FORGES)) {
    const commands = forge.path.match(/[a-zA-Z]/g) ?? [];
    const illegal = [...new Set(commands)].filter(
      (c) => !"MmZzLlHhVvCcSsQqTtAa".includes(c),
    );
    assert.deepEqual(illegal, [], `${name} uses ${illegal.join(",")}`);
    assert.doesNotMatch(forge.path, /[Zz]\s*[Zz]/, `${name} closes twice`);
  }
});

test("a repository url is matched to its forge", () => {
  assert.equal(forgeForUrl("https://github.com/o/r"), "github");
  assert.equal(forgeForUrl("https://gitlab.com/group/sub/r"), "gitlab");
  assert.equal(forgeForUrl("https://codeberg.org/o/r"), "codeberg");
});

test("a self-hosted subdomain still matches its forge", () => {
  assert.equal(forgeForUrl("https://git.gitlab.com/o/r"), "gitlab");
});

test("an unknown host yields no icon rather than a wrong one", () => {
  assert.equal(forgeForUrl("https://git.example.dev/o/r"), null);
  assert.equal(forgeForUrl("not a url"), null);
});

test("forgejo has no host: it is self-hosted under arbitrary domains", () => {
  assert.equal(FORGES.forgejo.host, null);
});
