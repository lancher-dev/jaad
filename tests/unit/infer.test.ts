import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normaliseRemote,
  editBaseFrom,
  inferRepo,
  inferDescription,
} from "../../packages/jaad/src/infer.ts";

test("ssh and https remotes normalise to the same browsable url", () => {
  const expected = "https://github.com/owner/repo";
  for (const remote of [
    "git@github.com:owner/repo.git",
    "git@github.com:owner/repo",
    "https://github.com/owner/repo.git",
    "https://github.com/owner/repo",
    "https://token@github.com/owner/repo.git",
  ]) {
    assert.equal(normaliseRemote(remote), expected, remote);
  }
});

test("non-github hosts and nested groups survive", () => {
  assert.equal(
    normaliseRemote("git@gitlab.com:group/sub/repo.git"),
    "https://gitlab.com/group/sub/repo",
  );
});

test("an unparseable remote yields null rather than a wrong link", () => {
  assert.equal(normaliseRemote("file:///srv/repo.git"), null);
  assert.equal(normaliseRemote(""), null);
});

test("the edit base points at the docs directory from the repository root", () => {
  const repo = { url: "https://github.com/o/r", branch: "main", prefix: "" };
  assert.equal(
    editBaseFrom(repo, "./docs"),
    "https://github.com/o/r/edit/main/docs/",
  );
});

test("a site in a subdirectory keeps the subdirectory in the edit link", () => {
  const repo = { url: "https://github.com/o/r", branch: "dev", prefix: "www/" };
  assert.equal(
    editBaseFrom(repo, "./docs"),
    "https://github.com/o/r/edit/dev/www/docs/",
  );
});

test("inference degrades to null instead of throwing outside a repository", () => {
  assert.equal(inferRepo("/"), null);
  assert.equal(inferDescription("/"), null);
});
