"use client";

import {
  Card,
  Chip,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import toast from "react-hot-toast";

import {
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
} from "@services/app/orders-api";
import { orderStatusChip } from "@utils/order-status";
import { ALLOWED_TRANSITIONS } from "@root/types/order";
import type { OrderStatus } from "@root/types/order";
import { ApiErrorState, EmptyState, Loading, PageHeader } from "@components/index";

export default function AdminOrders() {
  const { data, isLoading, isError } = useGetAllOrdersQuery();
  const [updateStatus, { isLoading: updating }] = useUpdateOrderStatusMutation();
  const orders = data?.data ?? [];

  const changeStatus = async (id: string, status: OrderStatus) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`Order marked ${status}`);
    } catch (err) {
      const message = (err as { data?: { message?: string } })?.data?.message ?? "Could not update status";
      toast.error(Array.isArray(message) ? message.join(", ") : message);
    }
  };

  if (isLoading) return <Loading label="Loading orders…" />;
  if (isError) return <ApiErrorState />;

  return (
    <>
      <PageHeader title="Orders" subtitle="Manage and fulfil customer orders" />

      {orders.length === 0 ? (
        <EmptyState title="No orders yet" description="Orders will appear here once customers check out." />
      ) : (
        <Card>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Update</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => {
                const badge = orderStatusChip(order.status);
                const nextOptions = ALLOWED_TRANSITIONS[order.status];
                return (
                  <TableRow key={order.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>#{order.id.slice(-8)}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{order.user?.name ?? "—"}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.user?.email ?? "unknown"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">${order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Chip label={badge.label} color={badge.color} size="small" />
                    </TableCell>
                    <TableCell>
                      {nextOptions.length === 0 ? (
                        <Typography variant="caption" color="text.secondary">
                          — closed
                        </Typography>
                      ) : (
                        <Select
                          size="small"
                          value=""
                          displayEmpty
                          disabled={updating}
                          onChange={(e) => changeStatus(order.id, e.target.value as OrderStatus)}
                          sx={{ minWidth: 150 }}
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
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </>
  );
}
