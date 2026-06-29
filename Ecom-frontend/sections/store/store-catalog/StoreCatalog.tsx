"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Card,
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
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";

import { useGetProductsQuery } from "@services/app/products-api";
import { useGetCategoriesQuery } from "@services/app/categories-api";
import { paths } from "@root/path";
import { ApiErrorState, EmptyState, Loading } from "@components/index";
import ProductCard from "@components/product-card/ProductCard";
import type { ProductSortBy } from "@root/types/product";

const LIMIT = 9;

export default function StoreCatalog() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // Initialise filter state from the URL so links are shareable.
  const [searchInput, setSearchInput] = useState(sp.get("search") ?? "");
  const [search, setSearch] = useState(sp.get("search") ?? "");
  const [category, setCategory] = useState(sp.get("category") ?? "all");
  const [minPrice, setMinPrice] = useState(sp.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(sp.get("maxPrice") ?? "");
  const [sort, setSort] = useState<ProductSortBy>(
    (sp.get("sortBy") as ProductSortBy) ?? "newest",
  );
  const [page, setPage] = useState(Number(sp.get("page") ?? "1") || 1);

  // Debounce the search input (300ms) → applied search term.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // React to external URL changes (e.g. the global header search) when this
  // page is already mounted.
  useEffect(() => {
    const urlSearch = sp.get("search") ?? "";
    setSearchInput((prev) => (prev !== urlSearch ? urlSearch : prev));
    setSearch((prev) => (prev !== urlSearch ? urlSearch : prev));
  }, [sp]);

  // Reflect filter state in the URL (shareable, back/forward friendly).
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category !== "all") params.set("category", category);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (sort !== "newest") params.set("sortBy", sort);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [search, category, minPrice, maxPrice, sort, page, pathname, router]);

  const { data, isLoading, isError, isFetching } = useGetProductsQuery({
    page,
    limit: LIMIT,
    search: search || undefined,
    category: category === "all" ? undefined : category,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    sortBy: sort,
  });
  const { data: recoData } = useGetProductsQuery({ page: 1, limit: 4 });
  const { data: catData } = useGetCategoriesQuery();
  const categoryOptions = ["all", ...(catData?.data.map((c) => c.name) ?? [])];

  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;
  const recommended = recoData?.data ?? [];
  const products = data?.data ?? [];

  return (
    <>
      <Typography variant="h4" fontWeight={800} mb={0.5}>
        Shop
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Browse our catalogue — sign in to add items to your cart.
      </Typography>

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
                <ProductCard product={p} compact />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Filter bar */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} gap={1.5} alignItems={{ md: "center" }}>
          <TextField
            placeholder="Search products…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            sx={{ flex: 1, maxWidth: { md: 360 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" gap={1} alignItems="center">
            <TextField
              size="small"
              placeholder="Min $"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setPage(1);
              }}
              sx={{ width: 96 }}
            />
            <Typography color="text.secondary">–</Typography>
            <TextField
              size="small"
              placeholder="Max $"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setPage(1);
              }}
              sx={{ width: 96 }}
            />
          </Stack>
          <TextField
            select
            label="Sort"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as ProductSortBy);
              setPage(1);
            }}
            sx={{ width: 190 }}
          >
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="price_asc">Price: Low → High</MenuItem>
            <MenuItem value="price_desc">Price: High → Low</MenuItem>
          </TextField>
        </Stack>

        {/* Category pills */}
        <Stack direction="row" gap={1} mt={2} flexWrap="wrap">
          {categoryOptions.map((c) => (
            <Chip
              key={c}
              label={c === "all" ? "All" : c}
              clickable
              onClick={() => {
                setCategory(c);
                setPage(1);
              }}
              color={category === c ? "primary" : "default"}
              variant={category === c ? "filled" : "outlined"}
              sx={{ textTransform: "capitalize" }}
            />
          ))}
        </Stack>
      </Card>

      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Typography variant="body2" color="text.secondary">
          {total} products
        </Typography>
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
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
          <Stack alignItems="center" mt={4}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, p) => setPage(p)}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Stack>
        </>
      )}
    </>
  );
}
