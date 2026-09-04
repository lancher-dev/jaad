import type { JaadResolvedConfig } from "./config.ts";

const MODULE_ID = "virtual:jaad/config";
const RESOLVED_ID = "\0" + MODULE_ID;

const USER_CSS_ID = "virtual:jaad/user.css";
const RESOLVED_USER_CSS = "\0" + USER_CSS_ID;

const THEME_CSS_ID = "virtual:jaad/theme.css";
const RESOLVED_THEME_CSS = "\0" + THEME_CSS_ID;

const DOCS_FRAME_ID = "virtual:jaad/docs-frame";
const RESOLVED_DOCS_FRAME = "\0" + DOCS_FRAME_ID;

export function jaadVirtualPlugin(
  config: JaadResolvedConfig,
  userCss: string | null,
  themeCss: string | null,
  docsFrame: () => string,
) {
  return {
    name: "jaad:virtual",
    resolveId(source: string) {
      if (source === MODULE_ID) return RESOLVED_ID;
      // Redirecting to the real path lets Vite process it as ordinary CSS.
      if (source === USER_CSS_ID) return userCss ?? RESOLVED_USER_CSS;
      if (source === THEME_CSS_ID) return themeCss ?? RESOLVED_THEME_CSS;
      if (source === DOCS_FRAME_ID) return RESOLVED_DOCS_FRAME;
      return null;
    },
    load(id: string) {
      if (id === RESOLVED_ID)
        return `export default ${JSON.stringify(config)};`;
      if (id === RESOLVED_USER_CSS || id === RESOLVED_THEME_CSS) return "";
      if (id === RESOLVED_DOCS_FRAME)
        return `export { default } from ${JSON.stringify(docsFrame())};`;
      return null;
    },
  };
}
