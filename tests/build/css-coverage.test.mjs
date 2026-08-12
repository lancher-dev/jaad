import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { allCss, packageClasses, missingFrom } from "../dist.mjs";

const SRC = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../packages/jaad/src",
);

test("every utility used by the package ships in the built CSS", () => {
  const classes = packageClasses(SRC);
  assert.ok(classes.size > 0, "no classes found; did the source move?");

  assert.deepEqual(
    missingFrom(allCss(), classes),
    [],
    "Tailwind never scans node_modules; the package CSS needs an @source pointing at its own sources",
  );
});
