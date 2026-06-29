"use client";

import Link from "next/link";
import {
  Box,
  Card,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import toast from "react-hot-toast";

import {
  useGetAdminOrderByIdQuery,
  useUpdateOrderStatusMutation,
} from "@services/app/orders-api";
import { orderStatusChip } from "@utils/order-status";
import { ALLOWED_TRANSITIONS } from "@root/types/order";
import type { OrderStatus } from "@root/types/order";
import { paths } from "@root/path";
import { ApiErrorState, Button, Loading, PageHeader } from "@components/index";

export default function AdminOrderDetail({ orderId }: { orderId: string }) {
  const { data, isLoading, isError } = useGetAdminOrderByIdQuery(orderId);
  const [updateStatus, { isLoading: updating }] = useUpdateOrderStatusMutation();
  const order = data?.data;

  if (isLoading) return <Loading label="Loading order…" />;
  if (isError || !order) return <ApiErrorState message="Order not found." />;

  const badge = orderStatusChip(order.status);
  const nextOptions = ALLOWED_TRANSITIONS[order.status];

  const changeStatus = async (status: OrderStatus) => {
    try {
      await updateStatus({ id: order.id, status }).unwrap();
      toast.success(`Order marked ${status}`);
    } catch (err) {
      const message = (err as { data?: { message?: string } })?.data?.message ?? "Could not update status";
      toast.error(Array.isArray(message) ? message.join(", ") : message);
    }
  };

  return (
    <>
      <Box mb={1}>
        <Button component={Link} href={paths.admin.orders} color="inherit" startIcon={<ArrowBackIcon />}>
          Back to orders
        </Button>
      </Box>
      <PageHeader
        title={`Order #${order.id.slice(-8)}`}
        subtitle={new Date(order.createdAt).toLocaleString()}
        action={<Chip label={badge.label} color={badge.color} />}
      />

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 0 }}>
            <Typography variant="h6" fontWeight={700} sx={{ p: 2.5 }}>
              Items
            </Typography>
            <Divider />
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
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
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2.5, mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" mb={1}>
              Customer
            </Typography>
            <Typography fontWeight={600}>{order.user?.name ?? "—"}</Typography>
            <Typography variant="body2" color="text.secondary">
              {order.user?.email ?? "unknown"}
            </Typography>
          </Card>

          <Card sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" color="text.secondary" mb={1}>
              Update status
            </Typography>
            <Stack direction="row" alignItems="center" gap={1.5} mb={1.5}>
              <Chip label={badge.label} color={badge.color} size="small" />
            </Stack>
            {nextOptions.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                This order is {order.status} — no further changes.
              </Typography>
            ) : (
              <Select
                fullWidth
                size="small"
                value=""
                displayEmpty
                disabled={updating}
                onChange={(e) => changeStatus(e.target.value as OrderStatus)}
              >
                <MenuItem value="" disabled>
                  Advance to…
                </MenuItem>
                {nextOptions.map((s) => (
                  <MenuItem key={s} value={s} sx={{ textTransform: "capitalize" }}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            )}
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
