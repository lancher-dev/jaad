/// <reference types="astro/client" />

declare module "virtual:jaad/config" {
  const config: import("./config.ts").JaadResolvedConfig;
  export default config;
}

declare module "virtual:jaad/docs-frame" {
  const DocsFrame: typeof import("./layouts/DefaultDocsFrame.astro").default;
  export default DocsFrame;
}
