"use client";

import { useState } from "react";
import {
  Box,
  Card,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import toast from "react-hot-toast";

import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
} from "@services/app/categories-api";
import {
  ApiErrorState,
  Button,
  ConfirmDialog,
  EmptyState,
  Loading,
  PageHeader,
} from "@components/index";
import type { Category } from "@root/types/category";

export default function AdminCategories() {
  const { data, isLoading, isError } = useGetCategoriesQuery();
  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
  const [deleteCategory, { isLoading: deleting }] = useDeleteCategoryMutation();

  const [name, setName] = useState("");
  const [toDelete, setToDelete] = useState<Category | null>(null);

  const categories = data?.data ?? [];

  const add = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      await createCategory({ name: trimmed }).unwrap();
      toast.success("Category added");
      setName("");
    } catch (err) {
      const message = (err as { data?: { message?: string } })?.data?.message ?? "Could not add category";
      toast.error(Array.isArray(message) ? message.join(", ") : message);
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    try {
      await deleteCategory(toDelete.id).unwrap();
      toast.success(`"${toDelete.name}" deleted`);
      setToDelete(null);
    } catch {
      toast.error("Could not delete category");
    }
  };

  return (
    <>
      <PageHeader title="Categories" subtitle="Manage product categories" />

      <Card sx={{ p: 2, mb: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          gap={1.5}
          alignItems={{ sm: "center" }}
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            add();
          }}
        >
          <TextField
            label="New category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ flex: 1, maxWidth: 360 }}
          />
          <Button type="submit" variant="contained" startIcon={<AddIcon />} disabled={creating}>
            Add category
          </Button>
        </Stack>
      </Card>

      {isLoading ? (
        <Loading label="Loading categories…" />
      ) : isError ? (
        <ApiErrorState />
      ) : categories.length === 0 ? (
        <EmptyState title="No categories yet" description="Add your first category above." />
      ) : (
        <Card>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell sx={{ fontWeight: 600, textTransform: "capitalize" }}>{c.name}</TableCell>
                  <TableCell>
                    {new Date(c.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="error" onClick={() => setToDelete(c)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete category?"
        description={`Remove "${toDelete?.name}". Existing products keep their category value.`}
        confirmText="Delete"
        loading={deleting}
        onConfirm={remove}
        onClose={() => setToDelete(null)}
      />

      <Box mt={2}>
        <Typography variant="caption" color="text.secondary">
          New categories appear in the product form&apos;s category dropdown.
        </Typography>
      </Box>
    </>
  );
}
