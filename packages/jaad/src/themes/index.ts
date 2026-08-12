export interface Preset {
  /** Shiki theme, or a light/dark pair, for code blocks. */
  shiki: string | { light: string; dark: string };
  /** Stylesheet next to this file, or null when the defaults already apply. */
  css: string | null;
}

export const PRESETS: Record<string, Preset> = {
  default: { shiki: { light: "github-light", dark: "github-dark" }, css: null },
  dracula: { shiki: "dracula", css: "dracula.css" },
  nord: { shiki: "nord", css: "nord.css" },
  "one-dark": { shiki: "one-dark-pro", css: "one-dark.css" },
};

export const PRESET_NAMES = Object.keys(PRESETS);

export const isPreset = (value: string): boolean => value in PRESETS;
