import type { TypographyVariantsOptions } from "@mui/material/styles";

export const createTypography = (): TypographyVariantsOptions => ({
  fontFamily:
    'var(--font-outfit), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  h1: { fontWeight: 700, fontSize: "2.5rem", lineHeight: 1.2 },
  h2: { fontWeight: 700, fontSize: "2rem", lineHeight: 1.2 },
  h3: { fontWeight: 600, fontSize: "1.5rem", lineHeight: 1.3 },
  h4: { fontWeight: 600, fontSize: "1.25rem", lineHeight: 1.35 },
  h5: { fontWeight: 600, fontSize: "1.125rem", lineHeight: 1.4 },
  h6: { fontWeight: 600, fontSize: "1rem", lineHeight: 1.4 },
  subtitle1: { fontWeight: 500, fontSize: "1rem" },
  subtitle2: { fontWeight: 500, fontSize: "0.875rem" },
  body1: { fontSize: "1rem", lineHeight: 1.5 },
  body2: { fontSize: "0.875rem", lineHeight: 1.5 },
  button: { fontWeight: 500, textTransform: "none" },
  caption: { fontSize: "0.75rem", lineHeight: 1.4 },
});
