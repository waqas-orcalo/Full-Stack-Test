export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  sku: string;
  stockQuantity: number;
  category: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPayload {
  name: string;
  description?: string;
  price: number;
  sku: string;
  stockQuantity?: number;
  category?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export type ProductSortBy = "price_asc" | "price_desc" | "newest";

export interface ProductQuery {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: ProductSortBy;
  page?: number;
  limit?: number;
}

/** GET /products response — returned directly (not inside the {success,…} envelope). */
export interface ProductListResponse {
  data: Product[];
  total: number;
  page: number;
  totalPages: number;
}

/** Standard backend response envelope for non-list endpoints. */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
