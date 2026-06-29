export const paths = {
  products: {
    base: "/shop",
    view: (id: string | number) => `/shop/${id}`,
  },
  cart: "/cart",
  checkout: "/checkout",
  orders: {
    base: "/orders",
    view: (id: string | number) => `/orders/${id}`,
  },
  auth: {
    login: "/login",
    signup: "/signup",
  },
  admin: {
    dashboard: "/admin/dashboard",
    products: "/admin/products",
    createProduct: "/admin/products/new",
    editProduct: (id: string | number) => `/admin/products/${id}/edit`,
    categories: "/admin/categories",
    orders: "/admin/orders",
    customers: "/admin/customers",
  },
};
