import { baseAPI } from "../base-api";
import { ORDERS } from "../tags";
import type { ApiResponse } from "@root/types/product";
import type { OrderStatus } from "@root/types/order";

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  ordersByStatus: Record<OrderStatus, number>;
  topProducts: { name: string; unitsSold: number }[];
}

export const adminStatsAPI = baseAPI.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAdminStats: builder.query<ApiResponse<AdminStats>, void>({
      query: () => ({ url: "/admin/stats", method: "GET" }),
      providesTags: [ORDERS],
    }),
  }),
});

export const { useGetAdminStatsQuery } = adminStatsAPI;
