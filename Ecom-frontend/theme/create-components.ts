import type { Components, Theme } from "@mui/material/styles";

/**
 * Global MUI component overrides — a clean, professional baseline so we don't
 * repeat sx everywhere (mirrors the COSMONYX-FE-001 create-components pattern).
 */
export const createComponents = (): Components<Theme> => ({
  MuiCssBaseline: {
    styleOverrides: {
      body: { backgroundColor: "#F6F7FB" },
    },
  },
  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      root: {
        borderRadius: 10,
        fontWeight: 600,
        textTransform: "none",
        paddingTop: 8,
        paddingBottom: 8,
        boxShadow: "none",
      },
      containedPrimary: {
        "&:hover": { boxShadow: "0 6px 16px rgba(79,70,229,0.28)" },
      },
      sizeLarge: { paddingTop: 11, paddingBottom: 11, fontSize: 15 },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        border: "1px solid #ECEEF3",
        boxShadow: "0 1px 2px rgba(16,24,40,0.04)",
        transition: "box-shadow .2s ease, transform .2s ease",
      },
    },
  },
  MuiPaper: {
    styleOverrides: { root: { backgroundImage: "none" } },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundColor: "rgba(255,255,255,0.8)",
        backdropFilter: "saturate(180%) blur(12px)",
        WebkitBackdropFilter: "saturate(180%) blur(12px)",
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: { borderRadius: 8, fontWeight: 600 },
      sizeSmall: { borderRadius: 7 },
    },
  },
  MuiTextField: {
    defaultProps: { size: "small", fullWidth: true },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: { borderRadius: 10 },
    },
  },
  MuiTableHead: {
    styleOverrides: {
      root: {
        "& .MuiTableCell-root": {
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "#6B7280",
          background: "#F9FAFB",
        },
      },
    },
  },
  MuiTableCell: {
    styleOverrides: { root: { borderColor: "#ECEEF3" } },
  },
  MuiMenu: {
    styleOverrides: {
      paper: {
        borderRadius: 12,
        marginTop: 6,
        minWidth: 200,
        border: "1px solid #ECEEF3",
        boxShadow: "0 10px 30px rgba(16,24,40,0.12)",
      },
    },
  },
});
