"use client";

import Link from "next/link";
import {
  Card,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

import { useGetOrdersQuery } from "@services/app/orders-api";
import { orderStatusChip } from "@utils/order-status";
import { paths } from "@root/path";
import { ApiErrorState, Button, EmptyState, Loading, PageHeader } from "@components/index";

export default function OrderHistory() {
  const { data, isLoading, isError } = useGetOrdersQuery();
  const orders = data?.data ?? [];

  return (
    <>
      <PageHeader title="My orders" subtitle="Your past orders and their status" />

      {isLoading ? (
        <Loading label="Loading orders…" />
      ) : isError ? (
        <ApiErrorState />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="When you place an order it will appear here."
          action={
            <Button component={Link} href={paths.products.base} variant="contained">
              Start shopping
            </Button>
          }
        />
      ) : (
        <Card>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center">Items</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => {
                const badge = orderStatusChip(order.status);
                const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
                return (
                  <TableRow key={order.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>#{order.id.slice(-8)}</TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell align="center">{itemCount}</TableCell>
                    <TableCell align="right">${order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip label={badge.label} color={badge.color} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        component={Link}
                        href={paths.orders.view(order.id)}
                        size="small"
                        variant="outlined"
                      >
                        View
                      </Button>
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
