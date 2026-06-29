"use client";

import Link from "next/link";
import { Box, Card, Grid, Stack, Typography } from "@mui/material";
import { useGetProductsQuery } from "@services/app/products-api";
import { useAuth } from "@hooks/use-auth";
import { PageHeader, Button } from "@components/index";
import { paths } from "@root/path";

/**
 * Admin dashboard. KPI summary derived from the products list for now; sales /
 * order analytics arrive with the orders module.
 */
export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { data } = useGetProductsQuery({ page: 1, limit: 100 });
  const items = data?.data ?? [];

  const totalProducts = data?.total ?? items.length;
  const lowStock = items.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= 5).length;
  const soldOut = items.filter((p) => p.stockQuantity <= 0).length;
  const inventoryValue = items.reduce((sum, p) => sum + p.price * p.stockQuantity, 0);

  const kpis = [
    { label: "Products", value: totalProducts },
    { label: "Low stock (≤5)", value: lowStock },
    { label: "Sold out", value: soldOut },
    { label: "Inventory value", value: `$${inventoryValue.toLocaleString()}` },
  ];

  return (
    <>
      <PageHeader
        title={`Welcome, ${user?.name ?? "Admin"}`}
        subtitle="Overview of your store"
        action={
          <Button component={Link} href={paths.admin.products} variant="contained">
            Manage products
          </Button>
        }
      />
      <Grid container spacing={2}>
        {kpis.map((k) => (
          <Grid item xs={6} md={3} key={k.label}>
            <Card sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary">
                {k.label}
              </Typography>
              <Typography variant="h4" fontWeight={800} mt={1}>
                {k.value}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box mt={3}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={1}>
            Next steps
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Order management and sales analytics (charts, top sellers, status
            breakdown) are designed and queued for the orders module.
          </Typography>
          <Stack direction="row" gap={1.5} mt={2}>
            <Button component={Link} href={paths.admin.products} variant="outlined">
              Products
            </Button>
            <Button component={Link} href={paths.admin.orders} variant="outlined">
              Orders
            </Button>
          </Stack>
        </Card>
      </Box>
    </>
  );
}
