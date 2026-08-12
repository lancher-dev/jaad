// @ts-check

import { defineConfig } from "astro/config";
import path from "path";
import { fileURLToPath } from "url";

import jaad from "jaad";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  site: "https://jaad.lancher.dev",
  base: "/",

  vite: {
    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
    },
    build: {
      sourcemap: false,
      rollupOptions: { output: { sourcemap: false } },
    },
  },

  integrations: [
    jaad({
      title: "JAAD",
      description:
        "JAAD - Just Another Astro Docs. A clean, minimalist documentation framework.",
      docsDir: "./docs",
    }),
  ],
});
