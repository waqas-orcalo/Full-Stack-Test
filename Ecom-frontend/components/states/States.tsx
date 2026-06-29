"use client";

import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import type { ReactNode } from "react";

export function Loading({ label = "Loading..." }: { label?: string }) {
  return (
    <Stack alignItems="center" justifyContent="center" gap={2} py={8}>
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
}

export function EmptyState({
  title = "Nothing here yet",
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Stack alignItems="center" justifyContent="center" gap={1.5} py={8}>
      <Box sx={{ color: "text.disabled" }}>
        <Inventory2OutlinedIcon sx={{ fontSize: 56 }} />
      </Box>
      <Typography variant="h6">{title}</Typography>
      {description ? (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      ) : null}
      {action ? <Box mt={1}>{action}</Box> : null}
    </Stack>
  );
}

export function ApiErrorState({ message }: { message?: string }) {
  return (
    <Stack alignItems="center" justifyContent="center" gap={1} py={8}>
      <Typography variant="h6" color="error.main">
        Something went wrong
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {message ?? "Could not reach the API. Is the backend running?"}
      </Typography>
    </Stack>
  );
}
