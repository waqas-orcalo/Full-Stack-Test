"use client";

import type { ReactNode } from "react";
import { Box } from "@mui/material";
import { GuestGuard } from "@root/guards";

/**
 * Guest-only group (login / signup), centered on a neutral canvas.
 */
export default function AuthGroupLayout({ children }: { children: ReactNode }) {
  return (
    <GuestGuard>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        {children}
      </Box>
    </GuestGuard>
  );
}
