# Contributing to JAAD

Install [Node.js 24.12 or newer](https://nodejs.org/) and
[pnpm 12+](https://pnpm.io/), then install the workspace dependencies:

```sh
pnpm install
```

Before opening a pull request, run the same checks as CI:

```sh
pnpm format
pnpm lint
pnpm check
pnpm test
pnpm build
pnpm test:build
pnpm test:consumer
```

## Translating the interface

JAAD bundles its own interface strings separately from the Markdown written by
its users. English is the canonical catalogue; every other catalogue must
contain exactly the same keys.

To contribute another language:

1. Copy `contributing/ui-locale.template.ts` to
   `packages/jaad/src/ui/<language>.ts`, using a lowercase ISO 639-1 language
   code for the filename.
2. Rename `UI_LOCALE` to a language-specific constant and translate every
   value. Do not leave empty strings.
3. Import the catalogue in `packages/jaad/src/ui.ts` and add its language code
   to `UI_CATALOGS`.
4. Add the catalogue to the completeness test in `tests/unit/ui.test.ts` and
   update the supported-language list in the i18n documentation.
5. Run the checks above.

Translate meaning rather than individual words. Keep labels concise, preserve
punctuation where it carries meaning, and remember that keys such as
`breadcrumb.label`, `nav.*`, `search.label`, and `theme.toggle` are also read
by assistive technology. Keyboard hints such as `search.open` and
`search.navigate` should remain short verbs.

Regional locales automatically inherit their base language. A catalogue for
`pt`, for example, also supplies the defaults for `pt-BR`; users can still
override either locale through their JAAD configuration.
