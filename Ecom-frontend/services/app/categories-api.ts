import { baseAPI } from "../base-api";
import { CATEGORIES } from "../tags";
import type { ApiResponse } from "@root/types/product";
import type { Category } from "@root/types/category";

export const categoriesAPI = baseAPI.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getCategories: builder.query<ApiResponse<Category[]>, void>({
      query: () => ({ url: "/categories", method: "GET" }),
      providesTags: [CATEGORIES],
    }),
    createCategory: builder.mutation<ApiResponse<Category>, { name: string; description?: string }>({
      query: (body) => ({ url: "/categories", method: "POST", body }),
      invalidatesTags: [CATEGORIES],
    }),
    deleteCategory: builder.mutation<ApiResponse<{ id: string }>, string>({
      query: (id) => ({ url: `/categories/${id}`, method: "DELETE" }),
      invalidatesTags: [CATEGORIES],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesAPI;
