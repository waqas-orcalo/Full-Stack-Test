import type { PaletteOptions } from "@mui/material/styles";
import { error, info, neutral, success, warning } from "./colors";
import type { ThemePreset } from "./presets";

export const createPalette = (preset: ThemePreset): PaletteOptions => ({
  mode: "light",
  primary: { main: preset.primary, dark: preset.primaryDark, contrastText: "#FFFFFF" },
  secondary: { main: preset.secondary, contrastText: "#FFFFFF" },
  success,
  warning,
  error,
  info,
  text: { primary: neutral[900], secondary: neutral[500], disabled: neutral[400] },
  background: { default: "#F6F7FB", paper: "#FFFFFF" },
  divider: "#ECEEF3",
});
