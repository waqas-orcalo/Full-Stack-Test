"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Badge,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

import { useGetAllOrdersQuery } from "@services/app/orders-api";
import { useGetProductsQuery } from "@services/app/products-api";
import { paths } from "@root/path";

interface Note {
  id: string;
  icon: React.ReactNode;
  text: string;
  meta: string;
  href: string;
}

export default function NotificationsBell() {
  const router = useRouter();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const { data: ordersRes } = useGetAllOrdersQuery();
  const { data: productsRes } = useGetProductsQuery({ page: 1, limit: 100 });

  const orders = ordersRes?.data ?? [];
  const products = productsRes?.data ?? [];

  const newOrders: Note[] = orders
    .filter((o) => o.status === "pending")
    .slice(0, 5)
    .map((o) => ({
      id: `order-${o.id}`,
      icon: <ReceiptLongOutlinedIcon fontSize="small" color="primary" />,
      text: `New order from ${o.user?.name ?? "customer"}`,
      meta: `#${o.id.slice(-8)} · $${o.totalAmount.toFixed(2)}`,
      href: paths.admin.viewOrder(o.id),
    }));

  const stockAlerts: Note[] = products
    .filter((p) => p.stockQuantity <= 5)
    .slice(0, 5)
    .map((p) => ({
      id: `stock-${p.id}`,
      icon:
        p.stockQuantity === 0 ? (
          <WarningAmberOutlinedIcon fontSize="small" color="error" />
        ) : (
          <Inventory2OutlinedIcon fontSize="small" color="warning" />
        ),
      text: p.stockQuantity === 0 ? `${p.name} is out of stock` : `${p.name} is low on stock`,
      meta: `${p.stockQuantity} left`,
      href: paths.admin.editProduct(p.id),
    }));

  const notes = [...newOrders, ...stockAlerts];

  const open = (href: string) => {
    setAnchor(null);
    router.push(href);
  };

  return (
    <>
      <IconButton onClick={(e) => setAnchor(e.currentTarget)} aria-label="Notifications">
        <Badge color="error" badgeContent={notes.length} invisible={notes.length === 0}>
          <NotificationsNoneOutlinedIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { width: 340, maxWidth: "90vw" } } }}
      >
        <Box sx={{ px: 2, py: 1.25 }}>
          <Typography fontWeight={700}>Notifications</Typography>
          <Typography variant="caption" color="text.secondary">
            {notes.length === 0 ? "You're all caught up" : `${notes.length} need attention`}
          </Typography>
        </Box>
        <Divider />

        {notes.length === 0 ? (
          <Box sx={{ px: 2, py: 3, textAlign: "center", color: "text.secondary" }}>
            <Typography variant="body2">No new notifications</Typography>
          </Box>
        ) : (
          notes.map((n) => (
            <MenuItem key={n.id} onClick={() => open(n.href)} sx={{ py: 1.25, whiteSpace: "normal" }}>
              <ListItemIcon>{n.icon}</ListItemIcon>
              <Stack>
                <Typography variant="body2" fontWeight={600}>
                  {n.text}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {n.meta}
                </Typography>
              </Stack>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
}
