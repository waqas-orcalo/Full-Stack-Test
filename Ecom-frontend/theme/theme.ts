import type { Theme } from "@mui/material/styles";
import { createTheme as createMuiTheme, responsiveFontSizes } from "@mui/material/styles";
import { createOptions } from "./create-options";
import { getPreset, type ThemePreset } from "./presets";

export const createTheme = (preset: ThemePreset = getPreset()): Theme => {
  let theme = createMuiTheme(createOptions(preset));
  theme = responsiveFontSizes(theme);
  return theme;
};
