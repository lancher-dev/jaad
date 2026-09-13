import tailwindcss from "@tailwindcss/vite";
import { defineJaadConfig } from "@lancher-dev/jaad";

export default defineJaadConfig({
  title: "__JAAD_TITLE__",
  routeBase: "/docs",
  nav: [{ label: "Docs", href: "/docs" }],
  // The landing page is styled with Tailwind; the documentation is not.
  astro: { vite: { plugins: [tailwindcss()] } },
});
