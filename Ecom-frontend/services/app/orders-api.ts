import { baseAPI } from "../base-api";
import { CART, ORDERS, PRODUCTS } from "../tags";
import type { ApiResponse } from "@root/types/product";
import type { AdminOrder, Order, OrderStatus } from "@root/types/order";

/**
 * Checkout + orders endpoints (all require auth) → backend /api.
 */
export const ordersAPI = baseAPI.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    checkout: builder.mutation<ApiResponse<Order>, { paymentToken: string }>({
      query: (body) => ({ url: "/checkout", method: "POST", body }),
      // Checkout empties the cart, changes stock, and adds an order.
      invalidatesTags: [CART, ORDERS, PRODUCTS],
    }),
    getOrders: builder.query<ApiResponse<Order[]>, void>({
      query: () => ({ url: "/orders", method: "GET" }),
      providesTags: [ORDERS],
    }),
    getOrderById: builder.query<ApiResponse<Order>, string>({
      query: (id) => ({ url: `/orders/${id}`, method: "GET" }),
      providesTags: [ORDERS],
    }),

    // Admin
    getAllOrders: builder.query<ApiResponse<AdminOrder[]>, void>({
      query: () => ({ url: "/admin/orders", method: "GET" }),
      providesTags: [ORDERS],
    }),
    updateOrderStatus: builder.mutation<
      ApiResponse<Order>,
      { id: string; status: OrderStatus }
    >({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: [ORDERS],
    }),
  }),
});

export const {
  useCheckoutMutation,
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
} = ordersAPI;
