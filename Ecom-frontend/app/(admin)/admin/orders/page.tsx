"use client";

import { Card, Typography } from "@mui/material";
import { PageHeader } from "@components/index";

/**
 * Placeholder for order management (table + status lifecycle). The design is
 * complete in the design reference; this lands with the orders module.
 */
export default function AdminOrdersPage() {
  return (
    <>
      <PageHeader title="Orders" subtitle="Manage and fulfil customer orders" />
      <Card sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6" fontWeight={700}>
          Order management coming next
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          The orders module will list all orders and let you advance status
          through pending → processing → shipped → delivered (and cancel).
        </Typography>
      </Card>
    </>
  );
}
