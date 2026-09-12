import { defineJaadConfig } from "@lancher-dev/jaad";

export default defineJaadConfig({
  site: "https://jaad.lancher.dev",
  title: "JAAD",
  lang: "en",
  routeBase: "/docs",
  description:
    "An Astro integration that turns a folder of Markdown into a documentation site.",
  astro: {
    redirects: {
      "/docs/getting-started/development":
        "/docs/getting-started/installation#run-locally",
      "/docs/markdown/reference": "/docs/markdown",
      "/docs/markdown/text-formatting": "/docs/markdown",
      "/docs/markdown/links": "/docs/markdown",
      "/docs/markdown/code-blocks": "/docs/markdown",
      "/docs/markdown/blockquotes": "/docs/markdown",
      "/docs/markdown/lists": "/docs/markdown",
      "/docs/markdown/tables": "/docs/markdown",
      "/docs/markdown/images--videos": "/docs/markdown",
      "/docs/markdown/alerts": "/docs/markdown",
      "/docs/markdown/detail--summary": "/docs/markdown",
      "/docs/markdown/spoiler": "/docs/markdown",
      "/docs/markdown/inner-html": "/docs/markdown",
      "/docs/markdown/combination": "/docs/markdown",
    },
  },
});
