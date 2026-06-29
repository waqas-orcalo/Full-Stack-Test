"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import {
  Box,
  Card,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
} from "@mui/material";
import toast from "react-hot-toast";

import { paths } from "@root/path";
import {
  useCreateProductMutation,
  useGetProductByIdQuery,
  useUpdateProductMutation,
} from "@services/app/products-api";
import {
  ApiErrorState,
  Button,
  Loading,
  PageHeader,
  RHFTextField,
} from "@components/index";
import type { ProductPayload } from "@root/types/product";

const schema = yup.object({
  name: yup.string().required("Name is required"),
  sku: yup.string().required("SKU is required"),
  price: yup
    .number()
    .typeError("Price must be a number")
    .min(0, "Price cannot be negative")
    .required("Price is required"),
  stock: yup
    .number()
    .typeError("Stock must be a number")
    .min(0, "Stock cannot be negative")
    .default(0),
  category: yup.string().default("general"),
  description: yup.string().default(""),
  isActive: yup.boolean().default(true),
});

type FormValues = yup.InferType<typeof schema>;

const defaultValues: FormValues = {
  name: "",
  sku: "",
  price: 0,
  stock: 0,
  category: "general",
  description: "",
  isActive: true,
};

export default function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(productId);

  const { data, isLoading, isError } = useGetProductByIdQuery(productId as string, {
    skip: !isEdit,
  });
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const methods = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues,
  });
  const { handleSubmit, reset, register } = methods;

  useEffect(() => {
    if (data?.data) {
      const p = data.data;
      reset({
        name: p.name,
        sku: p.sku,
        price: p.price,
        stock: p.stock,
        category: p.category,
        description: p.description ?? "",
        isActive: p.isActive,
      });
    }
  }, [data, reset]);

  const onSubmit = async (values: FormValues) => {
    const payload: ProductPayload = values;
    try {
      if (isEdit && productId) {
        await updateProduct({ id: productId, body: payload }).unwrap();
        toast.success("Product updated");
      } else {
        await createProduct(payload).unwrap();
        toast.success("Product created");
      }
      router.push(paths.products.base);
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        "Something went wrong";
      toast.error(Array.isArray(message) ? message.join(", ") : message);
    }
  };

  if (isEdit && isLoading) return <Loading label="Loading product..." />;
  if (isEdit && isError) return <ApiErrorState />;

  const saving = isCreating || isUpdating;

  return (
    <>
      <PageHeader
        title={isEdit ? "Edit Product" : "Add Product"}
        subtitle={isEdit ? "Update product details" : "Create a new product"}
      />

      <FormProvider {...methods}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Card sx={{ p: 3, maxWidth: 720 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={8}>
                <RHFTextField name="name" label="Name" />
              </Grid>
              <Grid item xs={12} sm={4}>
                <RHFTextField name="sku" label="SKU" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField name="price" label="Price" type="number" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField name="stock" label="Stock" type="number" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField name="category" label="Category" />
              </Grid>
              <Grid item xs={12}>
                <RHFTextField
                  name="description"
                  label="Description"
                  multiline
                  minRows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch defaultChecked {...register("isActive")} />}
                  label="Active"
                />
              </Grid>
            </Grid>

            <Stack direction="row" gap={1.5} mt={4}>
              <Button type="submit" variant="contained" disabled={saving}>
                {isEdit ? "Save Changes" : "Create Product"}
              </Button>
              <Button
                color="inherit"
                onClick={() => router.push(paths.products.base)}
                disabled={saving}
              >
                Cancel
              </Button>
            </Stack>
          </Card>
        </Box>
      </FormProvider>
    </>
  );
}
