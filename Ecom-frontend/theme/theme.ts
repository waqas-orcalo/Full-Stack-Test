import type { Theme } from "@mui/material/styles";
import {
  createTheme as createMuiTheme,
  responsiveFontSizes,
} from "@mui/material/styles";
import { createOptions } from "./create-options";

export const createTheme = (): Theme => {
  let theme = createMuiTheme(createOptions());
  theme = responsiveFontSizes(theme);
  return theme;
};
