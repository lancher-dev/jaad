import { defineJaadConfig } from "jaad";

export default defineJaadConfig({
  site: "https://example.dev",
  title: "Consumer Test",
  logo: "/logo.svg",
  head: [{ tag: "meta", attrs: { name: "consumer-probe", content: "ok" } }],
});
