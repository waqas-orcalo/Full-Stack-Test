"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Box, Card, Grid, Stack, Typography } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import { useCart } from "@root/contexts/cart-context";
import { useCheckoutMutation } from "@services/app/orders-api";
import { paths } from "@root/path";
import { Button, EmptyState, Loading } from "@components/index";

const SUCCESS_TOKEN = "tok_test_success";

export default function Checkout() {
  const router = useRouter();
  const { cartItems, totalItems, total, isLoading } = useCart();
  const [checkout, { isLoading: paying }] = useCheckoutMutation();
  const [error, setError] = useState<string | null>(null);

  const payNow = async () => {
    setError(null);
    try {
      const res = await checkout({ paymentToken: SUCCESS_TOKEN }).unwrap();
      // On success the cart is cleared server-side (and cache invalidated).
      router.push(paths.orders.view(res.data.id));
    } catch (err) {
      const status = (err as { status?: number })?.status;
      const message = (err as { data?: { message?: string } })?.data?.message;
      setError(
        status === 402
          ? "Payment was declined. Please try again."
          : (Array.isArray(message) ? message.join(", ") : message) ??
              "Checkout failed. Please try again.",
      );
    }
  };

  if (isLoading) return <Loading label="Loading…" />;

  if (cartItems.length === 0) {
    return (
      <EmptyState
        title="Nothing to check out"
        description="Your cart is empty."
        action={
          <Button component={Link} href={paths.products.base} variant="contained">
            Continue shopping
          </Button>
        }
      />
    );
  }

  return (
    <>
      <Typography variant="h4" fontWeight={800} mb={3}>
        Checkout
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <Box sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
              <Typography variant="h6" fontWeight={700}>
                Order summary
              </Typography>
            </Box>
            <Stack divider={<Box sx={{ borderBottom: "1px solid", borderColor: "divider" }} />}>
              {cartItems.map(({ product, quantity, lineTotal }) => (
                <Stack
                  key={product.id}
                  direction="row"
                  justifyContent="space-between"
                  sx={{ px: 2.5, py: 1.5 }}
                >
                  <Typography>
                    {product.name} <Typography component="span" color="text.secondary">× {quantity}</Typography>
                  </Typography>
                  <Typography fontWeight={600}>${lineTotal.toFixed(2)}</Typography>
                </Stack>
              ))}
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2.5 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Payment
            </Typography>
            <Stack direction="row" justifyContent="space-between" sx={{ py: 0.5, color: "text.secondary" }}>
              <span>Items</span>
              <span>{totalItems}</span>
            </Stack>
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ pt: 1.5, mt: 1, borderTop: "1px solid", borderColor: "divider", fontWeight: 700, fontSize: 18 }}
            >
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </Stack>

            <Alert severity="info" icon={<LockOutlinedIcon fontSize="small" />} sx={{ mt: 2 }}>
              Test mode — no real charge. Uses token <code>tok_test_success</code>.
            </Alert>

            <Button
              variant="contained"
              fullWidth
              size="large"
              sx={{ mt: 2 }}
              disabled={paying}
              onClick={payNow}
            >
              {paying ? "Processing…" : `Pay now · $${total.toFixed(2)}`}
            </Button>
            <Button component={Link} href={paths.cart} fullWidth color="inherit" sx={{ mt: 1 }}>
              Back to cart
            </Button>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
