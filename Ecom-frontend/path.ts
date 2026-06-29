export const paths = {
  products: {
    base: "/shop",
    view: (id: string | number) => `/shop/${id}`,
  },
  cart: "/cart",
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
