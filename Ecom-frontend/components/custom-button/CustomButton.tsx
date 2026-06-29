"use client";

import { Button as MUIButton } from "@mui/material";
import type { ButtonProps } from "@mui/material";
import { styled } from "@mui/material/styles";

interface CustomButtonProps extends ButtonProps {
  capitalize?: boolean;
}

/**
 * Styled MUI Button — same approach as COSMONYX-FE-001 custom-button:
 * rounded corners, no text-transform, subtle inset highlight.
 */
const CustomButton = styled(MUIButton, {
  shouldForwardProp: (prop) => prop !== "capitalize",
})<CustomButtonProps>(({ capitalize = false }) => ({
  textTransform: capitalize ? "capitalize" : "none",
  boxShadow: "0px 1px 0px 1px rgba(255, 255, 255, 0.12) inset",
  fontWeight: 500,
  fontSize: "14px",
  borderRadius: "10px",
  minHeight: "40px",
  padding: "8px 16px",
}));

export default CustomButton;
