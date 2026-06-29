# Integration skill

Use this when connecting any page to the backend API (RTK Query).

## Step 1 — Add an endpoint to the RTK Query API

Every backend call goes through the shared `baseAPI` (services/base-api.ts),
injected per feature in `services/app/<feature>-api.ts`:

  export const productsAPI = baseAPI.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
      getProducts: builder.query<ProductListResponse, ProductQuery>({
        query: (params) => ({ url: "/products", method: "GET", params }),
        providesTags: [PRODUCTS],
      }),
    }),
  });
  export const { useGetProductsQuery } = productsAPI;

Then consume the generated hook in a section — never call `fetch` in a component.

## Step 2 — Auth header is automatic

`baseAPI` attaches `Authorization: Bearer <token>` from `state.auth.accessToken`
in `prepareHeaders` (services/base-api.ts). Do NOT set it manually. Endpoints
that only enhance behavior when logged in (e.g. suggestions) still work for guests.

## Step 3 — Loading & error handling in the component

  const { data, isLoading, isError } = useGetProductsQuery(params);
  if (isLoading) return <Loading />;
  if (isError) return <ApiErrorState />;

For mutations, surface server messages:

  try {
    await addItem(productId, qty);            // CartContext / mutation .unwrap()
  } catch (err) {
    const msg = (err as { data?: { message?: string } })?.data?.message;
    toast.error(Array.isArray(msg) ? msg.join(", ") : msg ?? "Something went wrong");
  }

Guards (AuthGuard/AdminGuard) handle redirects for protected/admin pages;
gated actions (add-to-cart) route guests to `/login`.

## Step 4 — Never trust client-side totals

Cart and order totals come from the server response (`subtotal`, `total`,
`totalAmount`). Never compute price × quantity on the client and show it as truth.

## Common mistakes to avoid

- Calling `fetch` directly in components — always go through RTK Query
- Re-implementing the auth header (it's already in base-api)
- Forgetting `invalidatesTags` so lists/badges don't refresh after a mutation
- Mutating Redux/context state directly instead of dispatching / using actions
