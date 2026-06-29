"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  InputAdornment,
  MenuItem,
  Pagination,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import toast from "react-hot-toast";

import { useGetProductsQuery } from "@services/app/products-api";
import { resolveImageUrl } from "@root/config";
import { useAuth } from "@hooks/use-auth";
import { paths } from "@root/path";
import { ApiErrorState, Button, EmptyState, Loading } from "@components/index";
import type { Product } from "@root/types/product";

const LIMIT = 9;
const CATEGORIES = ["all", "audio", "wearables", "cameras", "accessories"];

function ProductThumb({ product }: { product: Product }) {
  return (
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
  );
}

export default function StoreCatalog() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [category, setCategory] = useState("all");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const { data, isLoading, isError, isFetching } = useGetProductsQuery({
    page,
    limit: LIMIT,
    search: search || undefined,
    category: category === "all" ? undefined : category,
  });
  const { data: recoData } = useGetProductsQuery({ page: 1, limit: 4 });

  const result = data?.data;
  const totalPages = result?.totalPages ?? 1;
  const recommended = recoData?.data.items ?? [];

  // Price filter + sort applied client-side over the current page.
  const products = useMemo(() => {
    let items = result?.items ?? [];
    const min = priceMin ? Number(priceMin) : undefined;
    const max = priceMax ? Number(priceMax) : undefined;
    if (min !== undefined) items = items.filter((p) => p.price >= min);
    if (max !== undefined) items = items.filter((p) => p.price <= max);
    if (sort === "price_asc") items = [...items].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") items = [...items].sort((a, b) => b.price - a.price);
    return items;
  }, [result, priceMin, priceMax, sort]);

  const handleBuy = (product: Product) => {
    if (!isAuthenticated) {
      toast("Please sign in to purchase");
      router.push(`${paths.auth.login}?redirect=${encodeURIComponent(paths.products.base)}`);
      return;
    }
    toast.success(`${product.name} added to cart`);
  };

  const renderCard = (product: Product, compact = false) => {
    const soldOut = product.stock <= 0;
    return (
      <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <ProductThumb product={product} />
        <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
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
            <Typography variant="caption" color={soldOut ? "error.main" : "text.secondary"}>
              {soldOut ? "Sold out" : `${product.stock} in stock`}
            </Typography>
          </Stack>
          {!compact && (
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 1.5 }}
              disabled={soldOut}
              startIcon={<ShoppingCartOutlinedIcon />}
              onClick={() => handleBuy(product)}
            >
              {isAuthenticated ? "Add to cart" : "Sign in to buy"}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      {/* Recommended strip */}
      {recommended.length > 0 && (
        <Box mb={4}>
          <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
            <AutoAwesomeOutlinedIcon sx={{ color: "secondary.main" }} fontSize="small" />
            <Typography variant="h6" fontWeight={700}>
              Recommended for you
            </Typography>
          </Stack>
          <Grid container spacing={2}>
            {recommended.map((p) => (
              <Grid item xs={6} md={3} key={`reco-${p.id}`}>
                {renderCard(p, true)}
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Grid container spacing={3}>
        {/* Filters sidebar */}
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, mb: 2 }}>
            <Typography variant="overline" color="text.secondary">
              Category
            </Typography>
            <Stack mt={1}>
              {CATEGORIES.map((c) => (
                <Box
                  key={c}
                  onClick={() => {
                    setCategory(c);
                    setPage(1);
                  }}
                  sx={{
                    py: 0.75,
                    px: 1,
                    borderRadius: 1.5,
                    cursor: "pointer",
                    textTransform: "capitalize",
                    fontWeight: category === c ? 700 : 400,
                    color: category === c ? "primary.dark" : "text.primary",
                    bgcolor: category === c ? "#EEF2FF" : "transparent",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  {c}
                </Box>
              ))}
            </Stack>
          </Card>
          <Card sx={{ p: 2 }}>
            <Typography variant="overline" color="text.secondary">
              Price range
            </Typography>
            <Stack direction="row" gap={1} alignItems="center" mt={1}>
              <TextField
                size="small"
                placeholder="$0"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
              />
              <Typography color="text.secondary">–</Typography>
              <TextField
                size="small"
                placeholder="$999"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
              />
            </Stack>
          </Card>
        </Grid>

        {/* Catalog */}
        <Grid item xs={12} md={9}>
          <Stack direction={{ xs: "column", sm: "row" }} gap={1.5} mb={3} alignItems={{ sm: "center" }}>
            <TextField
              placeholder="Search products…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              sx={{ maxWidth: 360 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ flexGrow: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {result?.total ?? 0} products
            </Typography>
            <TextField select label="Sort" value={sort} onChange={(e) => setSort(e.target.value)} sx={{ width: 190 }}>
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="price_asc">Price: Low → High</MenuItem>
              <MenuItem value="price_desc">Price: High → Low</MenuItem>
            </TextField>
          </Stack>

          {isLoading ? (
            <Loading label="Loading products…" />
          ) : isError ? (
            <ApiErrorState />
          ) : products.length === 0 ? (
            <EmptyState title="No products found" description="Try a different search or filter." />
          ) : (
            <>
              <Grid container spacing={2} sx={{ opacity: isFetching ? 0.6 : 1 }}>
                {products.map((product) => (
                  <Grid item xs={12} sm={6} md={4} key={product.id}>
                    {renderCard(product)}
                  </Grid>
                ))}
              </Grid>
              <Stack alignItems="center" mt={4}>
                <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary" />
              </Stack>
            </>
          )}
        </Grid>
      </Grid>
    </>
  );
}
