/// <reference types="astro/client" />

declare module "virtual:jaad/config" {
  const config: import("./config.ts").JaadResolvedConfig;
  export default config;
}
