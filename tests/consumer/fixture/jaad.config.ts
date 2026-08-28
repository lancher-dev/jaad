import { defineJaadConfig } from "@lancher-dev/jaad";

export default defineJaadConfig({
  site: "https://example.dev",
  title: "Consumer Test",
  logo: "/logo.svg",
  nav: [{ label: "API", href: "https://api.example.dev" }],
  social: { github: "https://github.com/example/consumer" },
  head: [{ tag: "meta", attrs: { name: "consumer-probe", content: "ok" } }],
});
