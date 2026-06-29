"use client";

import Link from "next/link";
import {
  Box,
  Card,
  Chip,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import { useGetOrderByIdQuery } from "@services/app/orders-api";
import { orderStatusChip } from "@utils/order-status";
import { paths } from "@root/path";
import { ApiErrorState, Button, Loading } from "@components/index";

export default function OrderDetail({ orderId }: { orderId: string }) {
  const { data, isLoading, isError } = useGetOrderByIdQuery(orderId);
  const order = data?.data;

  if (isLoading) return <Loading label="Loading order…" />;
  if (isError || !order) return <ApiErrorState message="Order not found." />;

  const badge = orderStatusChip(order.status);
  const placed = new Date(order.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Box sx={{ maxWidth: 720, mx: "auto" }}>
      <Stack alignItems="center" textAlign="center" mb={3}>
        <CheckCircleOutlineIcon sx={{ fontSize: 56, color: "success.main", mb: 1 }} />
        <Typography variant="h4" fontWeight={800}>
          Thank you — your order is confirmed
        </Typography>
        <Typography color="text.secondary" mt={0.5}>
          Order <b>#{order.id}</b> · placed {placed}
        </Typography>
      </Stack>

      <Card sx={{ p: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2.5 }}>
          <Typography variant="h6" fontWeight={700}>
            Order details
          </Typography>
          <Chip label={badge.label} color={badge.color} size="small" />
        </Stack>
        <Divider />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="center">Qty</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {order.items.map((item) => (
              <TableRow key={item.product}>
                <TableCell>{item.name}</TableCell>
                <TableCell align="right">${item.priceAtPurchase.toFixed(2)}</TableCell>
                <TableCell align="center">{item.quantity}</TableCell>
                <TableCell align="right">
                  ${(item.priceAtPurchase * item.quantity).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Divider />
        <Stack direction="row" justifyContent="space-between" sx={{ p: 2.5, fontWeight: 700, fontSize: 18 }}>
          <span>Total</span>
          <span>${order.totalAmount.toFixed(2)}</span>
        </Stack>
      </Card>

      <Stack direction="row" gap={1.5} justifyContent="center" mt={3}>
        <Button component={Link} href={paths.products.base} variant="contained">
          Continue shopping
        </Button>
        <Button component={Link} href={paths.orders.base} variant="outlined">
          View all orders
        </Button>
      </Stack>
    </Box>
  );
}
