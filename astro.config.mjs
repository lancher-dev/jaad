// @ts-check
import { defineConfig } from "astro/config";
import path from "path";
import { fileURLToPath } from "url";

import tailwindcss from "@tailwindcss/vite";

// Remark plugins
import { remarkAlert } from "remark-github-blockquote-alert";
import remarkDirective from "remark-directive";
import remarkCodeTabs from "./src/utils/remark-code-tabs.ts";

import react from "@astrojs/react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  // Put here the site url of your production website, for example: https://www.example.com
  site: "https://jaad.lancher.dev",
  base: "/",

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          sourcemap: false,
        },
      },
    },
  },

  markdown: {
    remarkPlugins: [remarkAlert, remarkDirective, remarkCodeTabs],
    rehypePlugins: [],
    shikiConfig: {
      theme: "github-light",
      wrap: true,
    },
  },

  integrations: [react()],
});
