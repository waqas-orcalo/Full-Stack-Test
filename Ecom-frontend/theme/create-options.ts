import type { ThemeOptions } from "@mui/material/styles";
import { createComponents } from "./create-components";
import { createPalette } from "./create-palette";
import { createTypography } from "./create-typography";
import { getPreset, type ThemePreset } from "./presets";

export const createOptions = (preset: ThemePreset = getPreset()): ThemeOptions => ({
  palette: createPalette(preset),
  typography: createTypography(),
  components: createComponents(),
  shape: { borderRadius: 10 },
});
