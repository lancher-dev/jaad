import { themes } from "@lancher-dev/jaamd/themes";

export interface Preset {
  /** Shiki theme, or a light/dark pair, for code blocks. */
  shiki: string | { light: string; dark: string };
  /** JAAMD theme slug, or null when JAAD's own identity already applies. */
  theme: string | null;
  /** `dual` carries a light and a dark palette; the others apply in both modes. */
  mode: "light" | "dark" | "dual";
}

/**
 * The palettes come from JAAMD, which ships them with a manifest; JAAD adds only
 * `default`, its own identity, which needs no stylesheet.
 */
export const PRESETS: Record<string, Preset> = {
  default: {
    shiki: { light: "github-light", dark: "github-dark" },
    theme: null,
    mode: "dual",
  },
  ...Object.fromEntries(
    themes.map((theme) => [
      theme.slug,
      { shiki: theme.shiki, theme: theme.slug, mode: theme.mode },
    ]),
  ),
};

export const PRESET_NAMES = Object.keys(PRESETS);

export const isPreset = (value: string): boolean => value in PRESETS;
