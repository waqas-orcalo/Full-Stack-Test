"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Card,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchIcon from "@mui/icons-material/Search";
import toast from "react-hot-toast";

import { paths } from "@root/path";
import { resolveImageUrl } from "@root/config";
import {
  useDeleteProductMutation,
  useGetProductsQuery,
} from "@services/app/products-api";
import {
  ApiErrorState,
  Button,
  ConfirmDialog,
  EmptyState,
  Loading,
  PageHeader,
} from "@components/index";
import type { Product } from "@root/types/product";

export default function ProductsList() {
  const router = useRouter();
  const [page, setPage] = useState(0); // MUI is 0-based; API is 1-based
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState<Product | null>(null);

  const { data, isLoading, isError, isFetching } = useGetProductsQuery({
    page: page + 1,
    limit,
    search: search || undefined,
  });

  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const products = useMemo(() => data?.data ?? [], [data]);
  const total = data?.total ?? 0;

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteProduct(toDelete.id).unwrap();
      toast.success(`"${toDelete.name}" deleted`);
      setToDelete(null);
    } catch {
      toast.error("Failed to delete product");
    }
  };

  return (
    <>
      <PageHeader
        title="Products"
        subtitle="Manage your catalogue"
        action={
          <Button
            component={Link}
            href={paths.admin.createProduct}
            variant="contained"
            startIcon={<AddIcon />}
          >
            Add Product
          </Button>
        }
      />

      <Card sx={{ p: 2 }}>
        <Stack direction="row" mb={2}>
          <TextField
            placeholder="Search by name, SKU or description"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
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
        </Stack>

        {isLoading ? (
          <Loading label="Loading products..." />
        ) : isError ? (
          <ApiErrorState />
        ) : products.length === 0 ? (
          <EmptyState
            title="No products found"
            description="Create your first product to get started."
            action={
              <Button
                component={Link}
                href={paths.admin.createProduct}
                variant="contained"
                startIcon={<AddIcon />}
              >
                Add Product
              </Button>
            }
          />
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Stock</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody sx={{ opacity: isFetching ? 0.6 : 1 }}>
                  {products.map((product) => (
                    <TableRow key={product.id} hover>
                      <TableCell>
                        <Stack direction="row" alignItems="center" gap={1.5}>
                          <Avatar
                            variant="rounded"
                            src={resolveImageUrl(product.imageUrl) || undefined}
                            sx={{ width: 36, height: 36, bgcolor: "action.hover" }}
                          >
                            {product.name[0]}
                          </Avatar>
                          {product.name}
                        </Stack>
                      </TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell align="right">
                        ${product.price.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">{product.stockQuantity}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={product.isActive ? "Active" : "Inactive"}
                          color={product.isActive ? "success" : "default"}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() =>
                              router.push(paths.admin.editProduct(product.id))
                            }
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setToDelete(product)}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={limit}
              onRowsPerPageChange={(e) => {
                setLimit(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </>
        )}
      </Card>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete product?"
        description={`This will remove "${toDelete?.name}" from the catalogue.`}
        confirmText="Delete"
        loading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setToDelete(null)}
      />
    </>
  );
}
