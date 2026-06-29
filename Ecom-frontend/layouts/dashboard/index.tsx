"use client";

import type { ReactNode } from "react";
import {
  AppBar,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { paths } from "@root/path";
import { useAuth } from "@hooks/use-auth";
import { useThemePreset } from "@hooks/use-theme-preset";
import { NotificationsBell } from "@sections/admin/notifications";

const DRAWER_WIDTH = 248;

const navItems = [
  { label: "Dashboard", href: paths.admin.dashboard, icon: <DashboardOutlinedIcon />, exact: true },
  { label: "Products", href: paths.admin.products, icon: <Inventory2OutlinedIcon /> },
  { label: "Categories", href: paths.admin.categories, icon: <CategoryOutlinedIcon /> },
  { label: "Orders", href: paths.admin.orders, icon: <ReceiptLongOutlinedIcon /> },
  { label: "Customers", href: paths.admin.customers, icon: <GroupOutlinedIcon /> },
  { label: "Settings", href: paths.admin.settings, icon: <SettingsOutlinedIcon /> },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * Admin shell — deep-indigo sidebar + light content area, matching the design
 * reference (design/ecommerce-ui-design.html · admin screens).
 */
export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { preset } = useThemePreset();
  const SIDEBAR_BG = preset.sidebar;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          ml: `${DRAWER_WIDTH}px`,
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
        }}
      >
        <Toolbar>
          <Typography variant="h6" fontWeight={700}>
            Admin
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <NotificationsBell />
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            bgcolor: SIDEBAR_BG,
            color: "rgba(255,255,255,0.75)",
            border: "none",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1, py: 1.5, mb: 1 }}>
            <Box
              sx={{
                width: 26,
                height: 26,
                borderRadius: "8px",
                background: `linear-gradient(135deg, ${preset.gradient[0]}, ${preset.gradient[1]})`,
              }}
            />
            <Typography sx={{ color: "#fff", fontWeight: 800, fontFamily: "Outfit, sans-serif" }}>
              Aurora Admin
            </Typography>
          </Box>

          <List sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            {navItems.map((item) => {
              const active =
                "exact" in item && item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
              return (
                <ListItemButton
                  key={item.href}
                  component={Link}
                  href={item.href}
                  sx={{
                    borderRadius: 2,
                    color: active ? "#fff" : "rgba(255,255,255,0.75)",
                    bgcolor: active ? "rgba(255,255,255,0.14)" : "transparent",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.08)", color: "#fff" },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 38, color: "inherit" }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
              );
            })}
          </List>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ p: 2 }}>
          <ListItemButton
            onClick={() => {
              logout();
              router.push(paths.auth.login);
            }}
            sx={{
              borderRadius: 2,
              color: "rgba(255,255,255,0.75)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.08)", color: "#fff" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 38, color: "inherit" }}>
              <LogoutOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Sign out" primaryTypographyProps={{ fontSize: 14 }} />
          </ListItemButton>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 } }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
