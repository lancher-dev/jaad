import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";

const temporaryDirectories = new Set();

export function temporaryDirectory(prefix) {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  temporaryDirectories.add(dir);
  return dir;
}

export function cleanupTemporaryDirectories() {
  for (const dir of temporaryDirectories) rmSync(dir, { recursive: true });
  temporaryDirectories.clear();
}

export function run(command, args, cwd) {
  try {
    return execFileSync(command, args, {
      cwd,
      encoding: "utf8",
      stdio: "pipe",
    });
  } catch (error) {
    const stdout = error?.stdout?.toString().trim();
    const stderr = error?.stderr?.toString().trim();
    const details = [stdout, stderr].filter(Boolean).join("\n");
    throw new Error(
      `${command} ${args.join(" ")} failed${details ? `\n${details}` : ""}`,
      { cause: error },
    );
  }
}

/** Package into an isolated directory so concurrent suites never share a tgz. */
export function packPackage(packageDir) {
  const destination = temporaryDirectory("jaad-pack-");
  const output = run(
    "npm",
    ["pack", "--pack-destination", destination],
    packageDir,
  );
  return join(destination, basename(output.trim().split("\n").at(-1)));
}
