export const paths = {
  products: {
    base: "/products",
    view: (id: string | number) => `/products/${id}`,
  },
  auth: {
    login: "/login",
    signup: "/signup",
  },
  admin: {
    dashboard: "/admin",
    products: "/admin/products",
    createProduct: "/admin/products/new",
    editProduct: (id: string | number) => `/admin/products/${id}/edit`,
    orders: "/admin/orders",
  },
};
