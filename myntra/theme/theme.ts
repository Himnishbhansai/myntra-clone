import tinycolor from "tinycolor2";

export type ThemeMode =
  | "light"
  | "dark"
  | "system";

export const defaultAccent =
  "#FF3F6C";

export const baseThemes = {
  light: {
    background: "#FFFFFF",

    card: "#F5F5F5",

    text: "#111111",

    secondaryText:
      "#666666",

    border: "#E5E5E5",

    primary:
      defaultAccent,
  },

  dark: {
    background: "#121212",

    card: "#1E1E1E",

    text: "#FFFFFF",

    secondaryText:
      "#B3B3B3",

    border: "#333333",

    primary:
      defaultAccent,
  },
};

export const createSystemTheme = (
  accent: string
) => ({
  // overall app background
  background:
    tinycolor(accent)
      .lighten(42)
      .desaturate(10)
      .toHexString(),

  // cards and sections
  card:
    tinycolor(accent)
      .lighten(32)
      .desaturate(15)
      .toHexString(),

  // text becomes deep version
  text:
    tinycolor(accent)
      .darken(35)
      .saturate(10)
      .toHexString(),

  secondaryText:
    tinycolor(accent)
      .darken(10)
      .desaturate(20)
      .toHexString(),

  border:
    tinycolor(accent)
      .lighten(20)
      .toHexString(),

  primary: accent,
});