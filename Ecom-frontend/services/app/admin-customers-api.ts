import { baseAPI } from "../base-api";
import type { ApiResponse } from "@root/types/product";

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

export const adminCustomersAPI = baseAPI.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAdminCustomers: builder.query<ApiResponse<AdminCustomer[]>, void>({
      query: () => ({ url: "/admin/customers", method: "GET" }),
    }),
  }),
});

export const { useGetAdminCustomersQuery } = adminCustomersAPI;
