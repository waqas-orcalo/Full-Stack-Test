import type { Components, Theme } from "@mui/material/styles";

/**
 * Global MUI component overrides — keeps the look consistent without repeating
 * sx props everywhere (mirrors the COSMONYX-FE-001 create-components pattern).
 */
export const createComponents = (): Components<Theme> => ({
  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      root: { borderRadius: 10, fontWeight: 500, textTransform: "none" },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        border: "1px solid #E5E7EB",
        boxShadow: "0px 1px 2px rgba(16, 24, 40, 0.06)",
      },
    },
  },
  MuiPaper: {
    styleOverrides: { root: { backgroundImage: "none" } },
  },
  MuiTextField: {
    defaultProps: { size: "small", fullWidth: true },
  },
  MuiTableHead: {
    styleOverrides: {
      root: { "& .MuiTableCell-root": { fontWeight: 600, background: "#F9FAFB" } },
    },
  },
});
