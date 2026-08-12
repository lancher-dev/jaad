import type { JaadResolvedConfig } from "./config.ts";

const MODULE_ID = "virtual:jaad/config";
const RESOLVED_ID = "\0" + MODULE_ID;

const USER_CSS_ID = "virtual:jaad/user.css";
const RESOLVED_USER_CSS = "\0" + USER_CSS_ID;

export function jaadVirtualPlugin(
  config: JaadResolvedConfig,
  userCss: string | null,
) {
  return {
    name: "jaad:virtual",
    resolveId(source: string) {
      if (source === MODULE_ID) return RESOLVED_ID;
      // Redirecting to the real path lets Vite process it as ordinary CSS.
      if (source === USER_CSS_ID) return userCss ?? RESOLVED_USER_CSS;
      return null;
    },
    load(id: string) {
      if (id === RESOLVED_ID)
        return `export default ${JSON.stringify(config)};`;
      if (id === RESOLVED_USER_CSS) return "";
      return null;
    },
  };
}
