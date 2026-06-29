"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import {
  Box,
  Card,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import toast from "react-hot-toast";

import { paths } from "@root/path";
import { resolveImageUrl } from "@root/config";
import {
  useCreateProductMutation,
  useGetProductByIdQuery,
  useUpdateProductMutation,
  useUploadProductImageMutation,
} from "@services/app/products-api";
import { useGetCategoriesQuery } from "@services/app/categories-api";
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
    .positive("Price must be a positive number")
    .required("Price is required"),
  stockQuantity: yup
    .number()
    .typeError("Stock must be a number")
    .integer("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .default(0),
  category: yup.string().default("general"),
  description: yup.string().default(""),
  imageUrl: yup.string().default(""),
  isActive: yup.boolean().default(true),
});

type FormValues = yup.InferType<typeof schema>;

const defaultValues: FormValues = {
  name: "",
  sku: "",
  price: 0,
  stockQuantity: 0,
  category: "general",
  description: "",
  imageUrl: "",
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
  const [uploadImage, { isLoading: isUploading }] = useUploadProductImageMutation();
  const { data: catData } = useGetCategoriesQuery();
  const categories = catData?.data ?? [];

  const methods = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues,
  });
  const { handleSubmit, reset, register, watch, setValue } = methods;
  const imageUrl = watch("imageUrl");

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadImage(file).unwrap();
      setValue("imageUrl", res.data.url, { shouldDirty: true });
      toast.success("Image uploaded");
    } catch {
      toast.error("Image upload failed");
    } finally {
      e.target.value = "";
    }
  };

  useEffect(() => {
    if (data?.data) {
      const p = data.data;
      reset({
        name: p.name,
        sku: p.sku,
        price: p.price,
        stockQuantity: p.stockQuantity,
        category: p.category,
        description: p.description ?? "",
        imageUrl: p.imageUrl ?? "",
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
      router.push(paths.admin.products);
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
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Product image
              </Typography>
              <Stack direction="row" gap={2} alignItems="center">
                <Box
                  sx={{
                    width: 96,
                    height: 96,
                    borderRadius: 2,
                    border: "1px dashed",
                    borderColor: "divider",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    bgcolor: "action.hover",
                    color: "text.disabled",
                  }}
                >
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolveImageUrl(imageUrl)}
                      alt="Product preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <ImageOutlinedIcon />
                  )}
                </Box>
                <Stack gap={1}>
                  <Button component="label" variant="outlined" disabled={isUploading}>
                    {isUploading ? "Uploading…" : "Upload image"}
                    <input
                      hidden
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={handleFile}
                    />
                  </Button>
                  {imageUrl && (
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => setValue("imageUrl", "", { shouldDirty: true })}
                    >
                      Remove
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Box>
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
                <RHFTextField name="stockQuantity" label="Stock quantity" type="number" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="category"
                  control={methods.control}
                  render={({ field, fieldState: { error } }) => {
                    const names = categories.map((c) => c.name);
                    // Preserve a product's existing category even if it's not
                    // in the managed list (e.g. legacy lowercase values).
                    const options =
                      field.value && !names.includes(field.value)
                        ? [field.value, ...names]
                        : names;
                    return (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        label="Category"
                        error={!!error}
                        helperText={
                          error?.message ??
                          (categories.length === 0
                            ? "No categories yet — add some under Categories"
                            : undefined)
                        }
                      >
                        {options.map((name) => (
                          <MenuItem key={name} value={name} sx={{ textTransform: "capitalize" }}>
                            {name}
                          </MenuItem>
                        ))}
                      </TextField>
                    );
                  }}
                />
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
                onClick={() => router.push(paths.admin.products)}
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
