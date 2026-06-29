export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  sku: string;
  stock: number;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPayload {
  name: string;
  description?: string;
  price: number;
  sku: string;
  stock?: number;
  category?: string;
  isActive?: boolean;
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

/** Backend list payload (inside the ApiResponse `data` envelope). */
export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Standard backend response envelope: { success, message, data }. */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
