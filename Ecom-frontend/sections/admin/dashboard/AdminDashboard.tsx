"use client";

import { Box, Card, Chip, Grid, Stack, Typography } from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useGetAdminStatsQuery } from "@services/app/admin-stats-api";
import { orderStatusChip } from "@utils/order-status";
import { ApiErrorState, Loading, PageHeader } from "@components/index";
import type { OrderStatus } from "@root/types/order";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card sx={{ p: 2.5 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h4" fontWeight={800} mt={1}>
        {value}
      </Typography>
    </Card>
  );
}

export default function AdminDashboard() {
  const { data, isLoading, isError } = useGetAdminStatsQuery();
  const stats = data?.data;

  if (isLoading) return <Loading label="Loading dashboard…" />;
  if (isError || !stats) return <ApiErrorState />;

  const statuses = Object.entries(stats.ordersByStatus) as [OrderStatus, number][];

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Store overview" />

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={4}>
          <StatCard label="Total revenue (delivered)" value={`$${stats.totalRevenue.toLocaleString()}`} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard label="Total orders" value={stats.totalOrders} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 2.5, height: "100%" }}>
            <Typography variant="body2" color="text.secondary" mb={1.5}>
              Orders by status
            </Typography>
            <Stack direction="row" gap={1} flexWrap="wrap">
              {statuses.map(([status, count]) => {
                const badge = orderStatusChip(status);
                return (
                  <Chip
                    key={status}
                    label={`${badge.label}: ${count}`}
                    color={badge.color}
                    size="small"
                    variant="outlined"
                  />
                );
              })}
            </Stack>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ p: 2.5 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Top 5 selling products (by units sold)
        </Typography>
        {stats.topProducts.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No sales yet.
          </Typography>
        ) : (
          <Box sx={{ width: "100%", height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topProducts} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8EAF0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="unitsSold" name="Units sold" fill="#4F46E5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Card>
    </>
  );
}
