// @ts-check

import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import eslintPluginAstro from "eslint-plugin-astro";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    ignores: [
      "**/dist/**",
      "**/.astro/**",
      "tests/consumer/fixture/**",
      "packages/create-jaad/templates/**",
    ],
  },

  {
    files: ["**/*.{js,mjs,cjs}"],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
  },

  eslintPluginAstro.configs.recommended,

  // The package ships its sources, so they get the rules that need type
  // information. astro check already covers what tsc alone can see.
  {
    files: ["**/*.ts"],
    extends: [tseslint.configs.strictTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // `test()` returns a promise that node:test itself collects.
  {
    files: ["tests/**"],
    rules: { "@typescript-eslint/no-floating-promises": "off" },
  },

  prettierConfig,
]);
