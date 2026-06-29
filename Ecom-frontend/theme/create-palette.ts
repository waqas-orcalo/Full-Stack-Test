import type { PaletteOptions } from "@mui/material/styles";
import {
  error,
  info,
  neutral,
  primary,
  secondary,
  success,
  warning,
} from "./colors";

export const createPalette = (): PaletteOptions => ({
  mode: "light",
  primary,
  secondary,
  success,
  warning,
  error,
  info,
  text: {
    primary: neutral[900],
    secondary: neutral[500],
    disabled: neutral[400],
  },
  background: {
    default: "#F8F9FC",
    paper: "#FFFFFF",
  },
  divider: neutral[200],
});
