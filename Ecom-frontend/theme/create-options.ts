import type { ThemeOptions } from "@mui/material/styles";
import { createComponents } from "./create-components";
import { createPalette } from "./create-palette";
import { createTypography } from "./create-typography";

export const createOptions = (): ThemeOptions => ({
  palette: createPalette(),
  typography: createTypography(),
  components: createComponents(),
  shape: { borderRadius: 10 },
});
