"use client";

import { Box, Card, Grid, Stack, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { useThemePreset } from "@hooks/use-theme-preset";
import { THEME_PRESETS } from "@theme/presets";
import { PageHeader } from "@components/index";

export default function AdminSettings() {
  const { presetId, setPreset } = useThemePreset();

  return (
    <>
      <PageHeader title="Settings" subtitle="Personalise the look and feel" />

      <Card sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700}>
          Change theme
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2.5}>
          Pick a color theme — it applies across the whole app instantly and is remembered.
        </Typography>

        <Grid container spacing={2}>
          {THEME_PRESETS.map((p) => {
            const active = p.id === presetId;
            return (
              <Grid item xs={12} sm={6} md={4} key={p.id}>
                <Card
                  onClick={() => setPreset(p.id)}
                  sx={{
                    p: 2,
                    cursor: "pointer",
                    border: "2px solid",
                    borderColor: active ? "primary.main" : "divider",
                    transition: ".15s",
                    "&:hover": { boxShadow: 4, transform: "translateY(-2px)" },
                  }}
                >
                  <Box
                    sx={{
                      height: 72,
                      borderRadius: 2,
                      mb: 1.5,
                      background: `linear-gradient(135deg, ${p.gradient[0]}, ${p.gradient[1]})`,
                      position: "relative",
                    }}
                  >
                    {/* swatches */}
                    <Stack direction="row" gap={0.75} sx={{ position: "absolute", left: 10, bottom: 10 }}>
                      {[p.primary, p.secondary, p.sidebar].map((c, idx) => (
                        <Box key={idx} sx={{ width: 16, height: 16, borderRadius: "5px", bgcolor: c, border: "2px solid rgba(255,255,255,0.6)" }} />
                      ))}
                    </Stack>
                    {active && (
                      <CheckCircleIcon sx={{ position: "absolute", top: 8, right: 8, color: "#fff" }} />
                    )}
                  </Box>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography fontWeight={700}>{p.name}</Typography>
                    {active && (
                      <Typography variant="caption" color="primary.main" fontWeight={700}>
                        Active
                      </Typography>
                    )}
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {p.description}
                  </Typography>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Card>
    </>
  );
}
