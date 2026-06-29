"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import toast from "react-hot-toast";

import {
  useGetProductByIdQuery,
  useGetProductsQuery,
} from "@services/app/products-api";
import { useAddToCartMutation } from "@services/app/cart-api";
import { resolveImageUrl } from "@root/config";
import { stockBadge } from "@utils/stock";
import { useAuth } from "@hooks/use-auth";
import { paths } from "@root/path";
import { ApiErrorState, Button, Loading } from "@components/index";
import type { Product } from "@root/types/product";

function Thumb({ product, big = false }: { product: Product; big?: boolean }) {
  return (
    <Box
      sx={{
        aspectRatio: big ? "1 / 1" : "4 / 3",
        borderRadius: big ? 3 : 0,
        background: "linear-gradient(135deg, #EEF2FF, #EDE9FE)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "primary.light",
        overflow: "hidden",
      }}
    >
      {product.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolveImageUrl(product.imageUrl)}
          alt={product.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <ShoppingCartOutlinedIcon sx={{ fontSize: big ? 72 : 36, opacity: 0.5 }} />
      )}
    </Box>
  );
}

export default function ProductDetail({ productId }: { productId: string }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [qty, setQty] = useState(1);

  const { data, isLoading, isError } = useGetProductByIdQuery(productId);
  const product = data?.data;
  const [addToCartApi, { isLoading: adding }] = useAddToCartMutation();

  // Suggestions: a small set from the same catalogue (excludes the current one).
  const { data: more } = useGetProductsQuery({ page: 1, limit: 5 });
  const suggestions = (more?.data ?? []).filter((p) => p.id !== productId).slice(0, 4);

  if (isLoading) return <Loading label="Loading product…" />;
  if (isError || !product) return <ApiErrorState message="Product not found." />;

  const soldOut = product.stockQuantity <= 0;
  const maxQty = Math.max(1, product.stockQuantity);

  const addToCart = async () => {
    if (!isAuthenticated) {
      toast("Please sign in to purchase");
      router.push(
        `${paths.auth.login}?redirect=${encodeURIComponent(paths.products.view(productId))}`,
      );
      return;
    }
    try {
      await addToCartApi({ productId, quantity: qty }).unwrap();
      toast.success(`${qty} × ${product.name} added to cart`);
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ?? "Could not add to cart";
      toast.error(Array.isArray(message) ? message.join(", ") : message);
    }
  };

  return (
    <>
      <Box mb={2}>
        <Typography
          component={Link}
          href={paths.products.base}
          variant="body2"
          sx={{ color: "text.secondary", textDecoration: "none" }}
        >
          ← Back to shop
        </Typography>
      </Box>

      <Card sx={{ p: { xs: 2, md: 4 } }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Thumb product={product} big />
          </Grid>
          <Grid item xs={12} md={6}>
            <Chip label={product.category} size="small" sx={{ mb: 1.5 }} />
            <Typography variant="h4" fontWeight={800}>
              {product.name}
            </Typography>
            <Typography variant="h4" color="primary.dark" fontWeight={800} sx={{ mt: 1.5 }}>
              ${product.price.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
              {product.description}
            </Typography>

            <Chip
              label={stockBadge(product.stockQuantity).label}
              color={stockBadge(product.stockQuantity).color}
              variant="outlined"
              size="small"
            />

            <Stack direction="row" alignItems="center" gap={1.5} sx={{ my: 3 }}>
              <Stack
                direction="row"
                alignItems="center"
                sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}
              >
                <IconButton size="small" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={soldOut}>
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <Typography sx={{ width: 40, textAlign: "center", fontWeight: 600 }}>
                  {qty}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                  disabled={soldOut}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Stack>

              <Button
                variant="contained"
                size="large"
                startIcon={<ShoppingCartOutlinedIcon />}
                disabled={soldOut || adding}
                onClick={addToCart}
              >
                {soldOut ? "Sold out" : isAuthenticated ? "Add to cart" : "Sign in to buy"}
              </Button>
              <Button variant="outlined" size="large" startIcon={<FavoriteBorderIcon />}>
                Save
              </Button>
            </Stack>

            <Card variant="outlined" sx={{ bgcolor: "background.default", p: 2 }}>
              <Stack direction="row" alignItems="center" gap={1}>
                <LocalShippingOutlinedIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  <b>Free shipping</b> over $50 · 30-day returns · 2-year warranty
                </Typography>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Card>

      {suggestions.length > 0 && (
        <Box mt={5}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            You may also like
          </Typography>
          <Grid container spacing={2}>
            {suggestions.map((p) => (
              <Grid item xs={6} md={3} key={p.id}>
                <Card
                  component={Link}
                  href={paths.products.view(p.id)}
                  sx={{
                    display: "block",
                    textDecoration: "none",
                    color: "inherit",
                    height: "100%",
                    transition: ".15s",
                    "&:hover": { boxShadow: 4, transform: "translateY(-2px)" },
                  }}
                >
                  <Thumb product={p} />
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight={600} noWrap>
                      {p.name}
                    </Typography>
                    <Stack direction="row" justifyContent="space-between" mt={0.5}>
                      <Typography color="primary.dark" fontWeight={700}>
                        ${p.price.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {p.stockQuantity > 0 ? "In stock" : "Sold out"}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </>
  );
}
