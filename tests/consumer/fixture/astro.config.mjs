import { defineConfig } from "astro/config";
import jaad from "jaad";

export default defineConfig({
  site: "https://example.dev",
  integrations: [jaad({ title: "Consumer Test" })],
});
