"use client";

import {
  Box,
  Card,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ReactNode } from "react";

import { useGetAdminStatsQuery } from "@services/app/admin-stats-api";
import { ApiErrorState, Loading, PageHeader } from "@components/index";
import type { OrderStatus } from "@root/types/order";

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "#F59E0B",
  processing: "#3B82F6",
  shipped: "#7C3AED",
  delivered: "#10B981",
  cancelled: "#EF4444",
};
const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function Kpi({
  icon,
  label,
  value,
  delta,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  delta?: { pct?: number; text?: string };
}) {
  const up = (delta?.pct ?? 0) >= 0;
  return (
    <Card sx={{ p: 2.5 }}>
      <Stack direction="row" alignItems="center" gap={0.75} color="text.secondary">
        {icon}
        <Typography variant="body2" fontWeight={600}>{label}</Typography>
      </Stack>
      <Typography variant="h4" fontWeight={800} mt={1.25}>{value}</Typography>
      {delta && (
        <Stack direction="row" alignItems="center" gap={0.5} mt={0.5}
          sx={{ color: delta.text ? "success.main" : up ? "success.main" : "error.main" }}>
          {!delta.text && (up ? <ArrowUpwardIcon sx={{ fontSize: 14 }} /> : <ArrowDownwardIcon sx={{ fontSize: 14 }} />)}
          <Typography variant="caption" fontWeight={700}>
            {delta.text ?? `${Math.abs(delta.pct ?? 0)}% vs last period`}
          </Typography>
        </Stack>
      )}
    </Card>
  );
}

export default function AdminDashboard() {
  const { data, isLoading, isError } = useGetAdminStatsQuery();
  const stats = data?.data;

  if (isLoading) return <Loading label="Loading dashboard…" />;
  if (isError || !stats) return <ApiErrorState />;

  const statuses = Object.entries(stats.ordersByStatus) as [OrderStatus, number][];
  const donutData = statuses.map(([status, count]) => ({ name: status, value: count }));

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Store overview"
        action={
          <TextField select size="small" defaultValue="30" sx={{ width: 150 }}>
            <MenuItem value="30">Last 30 days</MenuItem>
            <MenuItem value="7">Last 7 days</MenuItem>
          </TextField>
        }
      />

      {/* KPI cards */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Kpi icon={<PaidOutlinedIcon fontSize="small" />} label="Total sales"
            value={`$${stats.totalRevenue.toLocaleString()}`} delta={{ pct: stats.deltas.revenuePct }} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Kpi icon={<ReceiptLongOutlinedIcon fontSize="small" />} label="Orders"
            value={`${stats.totalOrders}`} delta={{ pct: stats.deltas.ordersPct }} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Kpi icon={<ShoppingBagOutlinedIcon fontSize="small" />} label="Avg order"
            value={`$${stats.avgOrderValue.toLocaleString()}`} delta={{ pct: stats.deltas.avgPct }} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Kpi icon={<GroupOutlinedIcon fontSize="small" />} label="Customers"
            value={`${stats.totalCustomers}`} delta={{ text: `${stats.deltas.newCustomers} new` }} />
        </Grid>
      </Grid>

      {/* Chart + donut */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={7.5}>
          <Card sx={{ p: 2.5, height: "100%" }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Sales over time</Typography>
            <Box sx={{ width: "100%", height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.salesOverTime} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={48}
                    tickFormatter={(v) => `$${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`} />
                  <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Sales"]} />
                  <Bar dataKey="total" fill="#6366F1" radius={[8, 8, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4.5}>
          <Card sx={{ p: 2.5, height: "100%" }}>
            <Typography variant="h6" fontWeight={700} mb={1}>Orders by status</Typography>
            <Box sx={{ position: "relative", height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                    innerRadius={58} outerRadius={84} paddingAngle={2} stroke="none">
                    {donutData.map((d) => (
                      <Cell key={d.name} fill={STATUS_COLORS[d.name as OrderStatus]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                <Typography variant="h5" fontWeight={800}>{stats.totalOrders}</Typography>
                <Typography variant="caption" color="text.secondary">orders</Typography>
              </Box>
            </Box>
            <Stack gap={0.75} mt={1.5}>
              {statuses.map(([status, count]) => (
                <Stack key={status} direction="row" alignItems="center" gap={1}>
                  <Box sx={{ width: 10, height: 10, borderRadius: "3px", bgcolor: STATUS_COLORS[status] }} />
                  <Typography variant="body2" color="text.secondary">{STATUS_LABEL[status]}</Typography>
                  <Box sx={{ flexGrow: 1 }} />
                  <Typography variant="body2" fontWeight={700}>{count}</Typography>
                </Stack>
              ))}
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Top-selling products */}
      <Card sx={{ p: 2.5, mt: 2 }}>
        <Typography variant="h6" fontWeight={700} mb={1.5}>Top-selling products</Typography>
        {stats.topProducts.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No sales yet.</Typography>
        ) : (
          <Stack divider={<Box sx={{ borderBottom: "1px solid", borderColor: "divider" }} />}>
            {stats.topProducts.map((p, i) => (
              <Stack key={p.name} direction="row" alignItems="center" gap={1.5} py={1.25}>
                <Box sx={{ width: 24, height: 24, borderRadius: "6px", bgcolor: "#EEF2FF", color: "primary.dark", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {i + 1}
                </Box>
                <Box sx={{ width: 36, height: 36, borderRadius: "6px", background: "linear-gradient(135deg,#EEF2FF,#EDE9FE)" }} />
                <Box>
                  <Typography fontWeight={600}>{p.name}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: "capitalize" }}>
                    {p.category || "—"} · {p.unitsSold} sold
                  </Typography>
                </Box>
                <Box sx={{ flexGrow: 1 }} />
                <Typography fontWeight={800} fontFamily="Outfit, sans-serif">
                  ${p.revenue.toLocaleString()}
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </Card>
    </>
  );
}
