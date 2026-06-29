"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { useAuth } from "@hooks/use-auth";
import { useCart } from "@root/contexts/cart-context";
import { paths } from "@root/path";

/**
 * Public storefront shell — refined top bar with a blurred sticky header,
 * brand mark, cart, and an account dropdown menu.
 */
export function StoreLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const router = useRouter();
  const { totalItems: cartCount } = useCart();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const closeMenu = () => setAnchor(null);

  const go = (href: string) => {
    closeMenu();
    router.push(href);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
        <Container maxWidth="lg" disableGutters>
          <Toolbar sx={{ gap: 2, minHeight: 68 }}>
            {/* Brand */}
            <Stack
              direction="row"
              alignItems="center"
              gap={1.25}
              component={Link}
              href={paths.products.base}
              sx={{ textDecoration: "none", color: "inherit" }}
            >
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: "9px",
                  background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                }}
              >
                <StorefrontOutlinedIcon sx={{ fontSize: 18 }} />
              </Box>
              <Typography variant="h6" fontWeight={800} fontFamily="Outfit, sans-serif" letterSpacing="-0.01em">
                Aurora
              </Typography>
            </Stack>

            <Stack direction="row" gap={0.5} sx={{ display: { xs: "none", md: "flex" }, ml: 2 }}>
              <Button component={Link} href={paths.products.base} color="inherit" sx={{ color: "text.secondary", fontWeight: 600 }}>
                Shop
              </Button>
            </Stack>

            <Box sx={{ flexGrow: 1 }} />

            {/* Cart — customers only (admins manage, they don't shop) */}
            {!isAdmin && (
              <Tooltip title="Cart">
                <IconButton component={Link} href={paths.cart} sx={{ color: "text.primary" }}>
                  <Badge color="primary" badgeContent={cartCount} invisible={cartCount === 0} overlap="circular">
                    <ShoppingBagOutlinedIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}

            {isAuthenticated ? (
              <>
                <Button
                  onClick={(e) => setAnchor(e.currentTarget)}
                  sx={{ ml: 0.5, pl: 0.5, pr: 1.25, borderRadius: 999, color: "text.primary", textTransform: "none" }}
                  startIcon={
                    <Avatar sx={{ width: 30, height: 30, bgcolor: "primary.main", fontSize: 14 }}>
                      {user?.name?.[0]?.toUpperCase() ?? "U"}
                    </Avatar>
                  }
                >
                  <Box sx={{ display: { xs: "none", sm: "block" }, fontWeight: 600 }}>{user?.name ?? "Account"}</Box>
                </Button>
                <Menu anchorEl={anchor} open={!!anchor} onClose={closeMenu} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }}>
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography fontWeight={700} noWrap>{user?.name}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>{user?.email}</Typography>
                  </Box>
                  <Divider />
                  <MenuItem onClick={() => go(paths.orders.base)}>
                    <ListItemIcon><ReceiptLongOutlinedIcon fontSize="small" /></ListItemIcon>
                    My orders
                  </MenuItem>
                  {isAdmin && (
                    <MenuItem onClick={() => go(paths.admin.dashboard)}>
                      <ListItemIcon><SpaceDashboardOutlinedIcon fontSize="small" /></ListItemIcon>
                      Admin panel
                    </MenuItem>
                  )}
                  <Divider />
                  <MenuItem
                    onClick={() => {
                      closeMenu();
                      logout();
                      router.push(paths.products.base);
                    }}
                    sx={{ color: "error.main" }}
                  >
                    <ListItemIcon><LogoutOutlinedIcon fontSize="small" color="error" /></ListItemIcon>
                    Sign out
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Stack direction="row" gap={1} alignItems="center">
                <Button component={Link} href={paths.auth.login} color="inherit" sx={{ color: "text.secondary" }}>
                  Sign in
                </Button>
                <Button component={Link} href={paths.auth.signup} variant="contained">
                  Sign up
                </Button>
              </Stack>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}
