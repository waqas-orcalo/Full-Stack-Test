export const paths = {
  products: {
    base: "/products",
    create: "/products/create",
    edit: (id: string | number) => `/products/edit/${id}`,
    view: (id: string | number) => `/products/${id}`,
  },
};
