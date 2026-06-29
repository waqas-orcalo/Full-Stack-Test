"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useAuth } from "@hooks/use-auth";
import { paths } from "@root/path";

/**
 * Public storefront shell, matching the design reference (Aurora Market):
 * brand, nav, search pill, wishlist + cart icons, and an auth-aware account
 * area with an Admin-panel link for admins.
 */
export function StoreLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const router = useRouter();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: "1px solid", borderColor: "divider" }}
      >
        <Toolbar sx={{ gap: 2.5, py: 0.5 }}>
          <Stack
            direction="row"
            alignItems="center"
            gap={1}
            component={Link}
            href={paths.products.base}
            sx={{ textDecoration: "none", color: "inherit" }}
          >
            <Box
              sx={{
                width: 26,
                height: 26,
                borderRadius: "8px",
                background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
              }}
            />
            <Typography variant="h6" fontWeight={800} fontFamily="Outfit, sans-serif">
              Aurora
            </Typography>
          </Stack>

          <Stack direction="row" gap={2} sx={{ display: { xs: "none", md: "flex" }, ml: 1 }}>
            <Typography component={Link} href={paths.products.base} sx={{ color: "primary.dark", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
              Shop
            </Typography>
          </Stack>

          {/* Search pill (decorative anchor to the catalog search) */}
          <Stack
            direction="row"
            alignItems="center"
            gap={1}
            sx={{
              flex: 1,
              maxWidth: 380,
              bgcolor: "background.default",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 999,
              px: 1.75,
              py: 0.9,
              color: "text.disabled",
              display: { xs: "none", sm: "flex" },
            }}
          >
            <SearchIcon fontSize="small" />
            <Typography variant="body2">Search products…</Typography>
          </Stack>

          <Box sx={{ flexGrow: 1 }} />

          <IconButton sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
            <FavoriteBorderIcon fontSize="small" />
          </IconButton>
          <IconButton sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
            <Badge color="primary" variant="dot" invisible>
              <ShoppingCartOutlinedIcon fontSize="small" />
            </Badge>
          </IconButton>

          {isAuthenticated ? (
            <Stack direction="row" alignItems="center" gap={1.5}>
              {isAdmin && (
                <Button component={Link} href={paths.admin.dashboard} size="small" variant="outlined">
                  Admin panel
                </Button>
              )}
              <Chip
                avatar={<Avatar>{user?.name?.[0]?.toUpperCase() ?? "U"}</Avatar>}
                label={user?.name ?? "Account"}
                variant="outlined"
              />
              <Button
                size="small"
                color="inherit"
                onClick={() => {
                  logout();
                  router.push(paths.products.base);
                }}
              >
                Sign out
              </Button>
            </Stack>
          ) : (
            <Stack direction="row" gap={1}>
              <Button component={Link} href={paths.auth.login} color="inherit">
                Sign in
              </Button>
              <Button component={Link} href={paths.auth.signup} variant="contained">
                Sign up
              </Button>
            </Stack>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}
