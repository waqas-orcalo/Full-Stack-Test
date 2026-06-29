import { baseAPI } from "../base-api";
import { CART, PRODUCTS } from "../tags";
import type { ApiResponse } from "@root/types/product";
import type { Cart } from "@root/types/cart";

/**
 * Cart endpoints (all require auth) → backend /api/cart.
 */
export const cartAPI = baseAPI.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getCart: builder.query<ApiResponse<Cart>, void>({
      query: () => ({ url: "/cart", method: "GET" }),
      providesTags: [CART],
    }),
    addToCart: builder.mutation<ApiResponse<Cart>, { productId: string; quantity?: number }>({
      query: (body) => ({ url: "/cart/items", method: "POST", body }),
      invalidatesTags: [CART],
    }),
    updateCartItem: builder.mutation<ApiResponse<Cart>, { productId: string; quantity: number }>({
      query: ({ productId, quantity }) => ({
        url: `/cart/items/${productId}`,
        method: "PUT",
        body: { quantity },
      }),
      invalidatesTags: [CART],
    }),
    removeCartItem: builder.mutation<ApiResponse<Cart>, string>({
      query: (productId) => ({ url: `/cart/items/${productId}`, method: "DELETE" }),
      invalidatesTags: [CART],
    }),
    clearCart: builder.mutation<ApiResponse<Cart>, void>({
      query: () => ({ url: "/cart", method: "DELETE" }),
      invalidatesTags: [CART, PRODUCTS],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
} = cartAPI;
