import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const git = (args: string[], cwd: string): string | null => {
  try {
    return execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
};

/** `git@host:owner/repo.git` and `https://host/owner/repo.git` both become
 *  `https://host/owner/repo`. */
export function normaliseRemote(remote: string): string | null {
  const ssh = remote.match(/^[\w.-]+@([\w.-]+):(.+?)(?:\.git)?$/);
  if (ssh) return `https://${ssh[1]}/${ssh[2]}`;

  const https = remote.match(
    /^https?:\/\/(?:[^@/]+@)?([\w.-]+)\/(.+?)(?:\.git)?$/,
  );
  if (https) return `https://${https[1]}/${https[2]}`;

  return null;
}

export interface RepoInfo {
  /** Browsable base, e.g. https://github.com/owner/repo */
  url: string;
  branch: string;
  /** Path from the repository root to the Astro project, "" at the root. */
  prefix: string;
}

/** Returns null outside a repository, in a tarball, or without an origin. */
export function inferRepo(cwd: string = process.cwd()): RepoInfo | null {
  const remote = git(["remote", "get-url", "origin"], cwd);
  if (!remote) return null;

  const url = normaliseRemote(remote);
  if (!url) return null;

  return {
    url,
    branch: git(["rev-parse", "--abbrev-ref", "HEAD"], cwd) || "main",
    prefix: git(["rev-parse", "--show-prefix"], cwd) ?? "",
  };
}

/**
 * Base URL for "edit this page", ending in a slash. The docs directory is
 * resolved against the repository root, not the Astro project, so a site living
 * in a subdirectory still links correctly.
 */
export function editBaseFrom(repo: RepoInfo, docsDir: string): string {
  const dir = docsDir.replace(/^\.\//, "").replace(/\/$/, "");
  const path = `${repo.prefix}${dir}`.replace(/^\/+/, "");
  return `${repo.url}/edit/${repo.branch}/${path}/`;
}

/** `:path` is substituted when present, otherwise the file is appended. */
export function editUrl(base: string, filePath: string): string {
  return base.includes(":path")
    ? base.replace(":path", filePath)
    : base.replace(/\/?$/, "/") + filePath;
}

export function inferDescription(cwd: string = process.cwd()): string | null {
  try {
    const pkg = JSON.parse(readFileSync(join(cwd, "package.json"), "utf8"));
    return typeof pkg.description === "string" && pkg.description
      ? pkg.description
      : null;
  } catch {
    return null;
  }
}
