"use client";

import Link from "next/link";
import { Box, Card, CardActionArea, CardContent, Chip, Stack, Typography } from "@mui/material";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { resolveImageUrl } from "@root/config";
import { paths } from "@root/path";
import { stockBadge } from "@utils/stock";
import type { Product } from "@root/types/product";

/**
 * The canonical storefront product card — used in the catalog and in the
 * product-detail suggestions so they look identical. Whole-card link to detail.
 */
export default function ProductCard({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  const badge = stockBadge(product.stockQuantity);
  return (
    <Card sx={{ height: "100%" }}>
      <CardActionArea
        component={Link}
        href={paths.products.view(product.id)}
        sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "stretch" }}
      >
        <Box
          sx={{
            aspectRatio: "4 / 3",
            background: "linear-gradient(135deg, #EEF2FF, #EDE9FE)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "primary.light",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Chip
            label={product.category}
            size="small"
            sx={{ position: "absolute", top: 10, left: 10, bgcolor: "background.paper" }}
          />
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolveImageUrl(product.imageUrl)}
              alt={product.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <ShoppingCartOutlinedIcon sx={{ fontSize: 40, opacity: 0.5 }} />
          )}
        </Box>
        <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", width: "100%" }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {product.name}
          </Typography>
          {!compact && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, flexGrow: 1 }}>
              {product.description}
            </Typography>
          )}
          <Stack direction="row" alignItems="center" justifyContent="space-between" mt={compact ? 1 : 0}>
            <Typography variant="h6" color="primary.dark" fontWeight={700}>
              ${product.price.toFixed(2)}
            </Typography>
            <Chip label={badge.label} color={badge.color} size="small" variant="outlined" />
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
