"use client";

import {
  Avatar,
  Card,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { useGetAdminCustomersQuery } from "@services/app/admin-customers-api";
import { ApiErrorState, EmptyState, Loading, PageHeader } from "@components/index";

export default function AdminCustomers() {
  const { data, isLoading, isError } = useGetAdminCustomersQuery();
  const customers = data?.data ?? [];

  return (
    <>
      <PageHeader title="Customers" subtitle="People who have signed up" />

      {isLoading ? (
        <Loading label="Loading customers…" />
      ) : isError ? (
        <ApiErrorState />
      ) : customers.length === 0 ? (
        <EmptyState title="No customers yet" />
      ) : (
        <Card>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="center">Orders</TableCell>
                <TableCell align="right">Total spent</TableCell>
                <TableCell>Joined</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>
                    <Stack direction="row" alignItems="center" gap={1.5}>
                      <Avatar sx={{ width: 34, height: 34, bgcolor: "primary.main", fontSize: 14 }}>
                        {c.name?.[0]?.toUpperCase() ?? "U"}
                      </Avatar>
                      <Typography fontWeight={600}>{c.name}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell align="center">{c.orderCount}</TableCell>
                  <TableCell align="right">${c.totalSpent.toLocaleString()}</TableCell>
                  <TableCell>
                    {c.createdAt
                      ? new Date(c.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </>
  );
}
