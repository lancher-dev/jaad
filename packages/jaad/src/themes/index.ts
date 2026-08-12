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
  "tokyo-night": { shiki: "tokyo-night", css: "tokyo-night.css" },
  gruvbox: {
    shiki: { light: "gruvbox-light-medium", dark: "gruvbox-dark-medium" },
    css: "gruvbox.css",
  },
  "rose-pine": {
    shiki: { light: "rose-pine-dawn", dark: "rose-pine" },
    css: "rose-pine.css",
  },
  "rose-pine-moon": {
    shiki: { light: "rose-pine-dawn", dark: "rose-pine-moon" },
    css: "rose-pine-moon.css",
  },
  catppuccin: {
    shiki: { light: "catppuccin-latte", dark: "catppuccin-mocha" },
    css: "catppuccin.css",
  },
};

export const PRESET_NAMES = Object.keys(PRESETS);

export const isPreset = (value: string): boolean => value in PRESETS;
