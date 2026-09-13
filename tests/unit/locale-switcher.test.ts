import { test } from "node:test";
import assert from "node:assert/strict";
import { nextSwitcherMarkup } from "../../packages/jaad/src/components/locale-switcher.ts";

/** Enough of a Document for the one query the swap makes. */
const documentWith = (switcher: { innerHTML: string } | null) =>
  ({
    querySelector: (selector: string) =>
      selector === "jaad-locale-switcher" ? switcher : null,
  }) as unknown as Document;

// The header is transition:persist, so without this the menu keeps linking to
// the alternates of the page the reader just left.
test("the switcher adopts the incoming page's markup", () => {
  const incoming = documentWith({ innerHTML: "<a href='/it/guida'>it</a>" });
  assert.equal(nextSwitcherMarkup(incoming), "<a href='/it/guida'>it</a>");
});

test("a document without a switcher leaves the persisted one alone", () => {
  assert.equal(nextSwitcherMarkup(documentWith(null)), null);
});

// Empty is a real answer, and not the same as "no switcher": returning "" has
// to replace the markup, while null has to leave it.
test("an empty switcher is adopted rather than ignored", () => {
  assert.equal(nextSwitcherMarkup(documentWith({ innerHTML: "" })), "");
});
