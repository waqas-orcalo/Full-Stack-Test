import { baseAPI } from "../base-api";
import { PRODUCTS } from "../tags";
import type {
  ApiResponse,
  Product,
  ProductListResponse,
  ProductPayload,
  ProductQuery,
} from "@root/types/product";

/**
 * Products CRUD endpoints, injected into the shared RTK Query baseAPI.
 * Maps 1:1 to the ecom-starter backend routes under /api/products.
 */
export const productsAPI = baseAPI.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // GET /products  -> { data: Product[], total, page, totalPages }
    getProducts: builder.query<ProductListResponse, ProductQuery>({
      query: (params) => ({
        url: "/products",
        method: "GET",
        params,
      }),
      providesTags: [PRODUCTS],
    }),

    // GET /products/:id
    getProductById: builder.query<ApiResponse<Product>, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "GET",
      }),
      providesTags: [PRODUCTS],
    }),

    // POST /products
    createProduct: builder.mutation<ApiResponse<Product>, ProductPayload>({
      query: (body) => ({
        url: "/products",
        method: "POST",
        body,
      }),
      invalidatesTags: [PRODUCTS],
    }),

    // PUT /products/:id
    updateProduct: builder.mutation<
      ApiResponse<Product>,
      { id: string; body: ProductPayload }
    >({
      query: ({ id, body }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [PRODUCTS],
    }),

    // DELETE /products/:id  (soft delete on the backend)
    deleteProduct: builder.mutation<
      ApiResponse<{ id: string; deleted: boolean }>,
      string
    >({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [PRODUCTS],
    }),

    // POST /products/upload  (multipart) -> { url: "/images/<file>" }
    uploadProductImage: builder.mutation<ApiResponse<{ url: string }>, File>({
      query: (file) => {
        const body = new FormData();
        body.append("file", file);
        return { url: "/products/upload", method: "POST", body };
      },
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadProductImageMutation,
} = productsAPI;
