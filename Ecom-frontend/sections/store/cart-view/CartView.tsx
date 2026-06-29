"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Box,
  Card,
  Grid,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import toast from "react-hot-toast";

import { useCart } from "@root/contexts/cart-context";
import { resolveImageUrl } from "@root/config";
import { paths } from "@root/path";
import { Button, EmptyState, Loading, PageHeader } from "@components/index";

export default function CartView() {
  const router = useRouter();
  const { cartItems, totalItems, subtotal, total, isLoading, updateItem, removeItem } = useCart();

  const changeQty = async (productId: string, quantity: number) => {
    try {
      await updateItem(productId, quantity); // qty <= 0 removes server-side
    } catch (err) {
      const message = (err as { data?: { message?: string } })?.data?.message ?? "Could not update";
      toast.error(Array.isArray(message) ? message.join(", ") : message);
    }
  };

  const remove = async (productId: string, name: string) => {
    try {
      await removeItem(productId);
      toast.success(`${name} removed`);
    } catch {
      toast.error("Could not remove item");
    }
  };

  if (isLoading) return <Loading label="Loading cart…" />;

  return (
    <>
      <PageHeader title="Shopping cart" subtitle="Review your items before checkout" />

      {cartItems.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          description="Browse the catalogue and add something you like."
          action={
            <Button component={Link} href={paths.products.base} variant="contained">
              Continue shopping
            </Button>
          }
        />
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell align="center">Qty</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cartItems.map(({ product, quantity, lineTotal }) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" gap={1.5}>
                          <Avatar
                            variant="rounded"
                            src={resolveImageUrl(product.imageUrl) || undefined}
                            sx={{ width: 48, height: 48, bgcolor: "action.hover" }}
                          >
                            {product.name[0]}
                          </Avatar>
                          <Box>
                            <Typography
                              component={Link}
                              href={paths.products.view(product.id)}
                              fontWeight={600}
                              sx={{ textDecoration: "none", color: "inherit" }}
                            >
                              {product.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {product.category}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell align="center">
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="center"
                          sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, width: "fit-content", mx: "auto" }}
                        >
                          <IconButton size="small" onClick={() => changeQty(product.id, quantity - 1)}>
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Typography sx={{ width: 32, textAlign: "center", fontWeight: 600 }}>
                            {quantity}
                          </Typography>
                          <IconButton size="small" onClick={() => changeQty(product.id, quantity + 1)}>
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <b>${lineTotal.toFixed(2)}</b>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton color="error" onClick={() => remove(product.id, product.name)}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Order summary
              </Typography>
              <Stack direction="row" justifyContent="space-between" sx={{ py: 0.5, color: "text.secondary" }}>
                <span>Items</span>
                <span>{totalItems}</span>
              </Stack>
              <Stack direction="row" justifyContent="space-between" sx={{ py: 0.5, color: "text.secondary" }}>
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </Stack>
              <Stack direction="row" justifyContent="space-between" sx={{ py: 0.5, color: "text.secondary" }}>
                <span>Shipping</span>
                <span>Free</span>
              </Stack>
              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ pt: 1.5, mt: 1, borderTop: "1px solid", borderColor: "divider", fontWeight: 700, fontSize: 18 }}
              >
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </Stack>
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => router.push(paths.checkout)}
              >
                Proceed to checkout
              </Button>
              <Button component={Link} href={paths.products.base} fullWidth sx={{ mt: 1 }} color="inherit">
                Continue shopping
              </Button>
            </Card>
          </Grid>
        </Grid>
      )}
    </>
  );
}
