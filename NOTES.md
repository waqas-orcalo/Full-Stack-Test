# NOTES

Mini e-commerce platform — a single NestJS + MongoDB backend (`ecom-backend` /
`ecom-starter`) serving a Next.js storefront + admin panel (`Ecom-frontend`).

## Product suggestions (open-ended requirement)

Suggestions are category-matched products the user hasn't ordered. With more
time I would implement collaborative filtering based on co-purchase patterns.

Implementation: `GET /products/:id/suggestions` returns up to 4 active products
in the same category as the viewed product, excluding the product itself and —
when the request is authenticated — any product the user has already ordered,
sorted newest-first. It uses an optional JWT guard so the endpoint works for
both guests and logged-in users. Shown on `/shop/[id]` as "You might also like"
(hidden when empty), using the same `ProductCard` as the catalog.

## Stack & key decisions

- **Backend:** NestJS, MongoDB via Mongoose. JWT auth (`@nestjs/jwt` + Passport),
  bcrypt password hashing, role-based guard (`customer` / `admin`).
- **Frontend:** Next.js App Router, MUI v6, Redux Toolkit + RTK Query, redux-persist,
  React Hook Form + yup, Recharts.
- **Money/stock integrity:** order totals and cart totals are always computed
  server-side from current product prices; order items store a `priceAtPurchase`
  snapshot. Stock is validated on add-to-cart and again at checkout; checkout
  decrements stock.
- **Response shape:** most endpoints use a `{ success, message, data }` envelope;
  `GET /products` intentionally returns the documented `{ data, total, page,
  totalPages }` shape directly (the global interceptor leaves paginated payloads
  unwrapped).

## Design workflow

The UI was designed first via a generated, navigable HTML reference
(`design/ecommerce-ui-design.html`) — a modern-minimal light system (indigo→violet
on neutral). The live app (store top bar, split-screen auth, deep-indigo admin
shell, product/cart/checkout screens) was built to match it.

## Assumptions

- Self-service signup always creates a `customer`; admins are seeded or promoted.
- Product images are uploaded to disk (`images/`, served at `/images/*`) and
  referenced by `imageUrl`. The seed downloads real category photos at runtime.
- Order status lifecycle: `pending → processing → shipped → delivered`, with
  `cancelled` reachable from `pending`/`processing`. Transitions are validated
  server-side.
- Frontend runs on `:3001`, backend on `:8000` (`/api` prefix). Backend CORS must
  allow the frontend origin.

## Trade-offs / with more time

- Checkout is a single mock-payment step (`paymentToken === "tok_test_success"`);
  no shipping form or real Stripe integration.
- MongoDB standalone has no multi-document transactions, so checkout's
  create-order → decrement-stock → clear-cart sequence isn't atomic (stock is
  re-validated immediately before commit). With a replica set I'd wrap it in a
  session/transaction.
- Suggestions are content-based (category); collaborative filtering would be next.
- More automated test coverage (currently focused on the highest-value logic).

## Verification note

During development the agent sandbox's file mount intermittently corrupted files
on read, which blocked automated `npm run build` runs from inside the tooling;
builds were verified by regenerating files on a clean local disk and by careful
manual review. Run `npm run build` in each project to confirm in your environment.
