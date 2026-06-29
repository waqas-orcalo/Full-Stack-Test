# CLAUDE.md

This is the persistent context file that both agents read before doing any work.

## Project overview

E-commerce platform with a customer storefront and an admin panel, sharing one
backend. NestJS backend, Next.js (App Router) frontend, MongoDB database, JWT auth.

## Architecture

- `/ecom-starter` — backend. NestJS + Mongoose (MongoDB), JWT auth, REST API.
  Runs on **port 8000** under the global prefix **`/api`**. Swagger at `/docs`.
- `/Ecom-frontend` — frontend. Next.js 15 (App Router) + TypeScript + MUI v6,
  Redux Toolkit + RTK Query for data, redux-persist for auth. Runs on **port 3001**.
- Database — MongoDB (collections, not SQL tables; no migrations). Uploaded
  product images are stored on disk in `/ecom-starter/images` and served at `/images/*`.

## Agents in this project

### frontend-agent

Owns everything inside `/Ecom-frontend`. Two sub-roles:

- design: pages (`app/`), sections (`sections/`), reusable components
  (`components/`), layouts (`layouts/`), the MUI theme (`theme/`)
- integration: RTK Query API (`services/`), the auth slice + `useAuth` hook,
  `CartContext`, route guards, data fetching, forms, error handling

### backend-agent

Owns everything inside `/ecom-starter`. Two sub-roles:

- api: Mongoose schemas, DTOs, services, controllers, guards, the seed script
- testing: all `*.spec.ts` and `*.e2e-spec.ts` files

## Shared rules (both agents follow these)

- Never commit `.env` — only `.env.example` with placeholder values
- TypeScript strict mode — no implicit any
- Passwords always bcrypt hashed — never plain text; `passwordHash` is
  `select: false` and stripped from every response
- HTTP errors must use correct status codes: 400, 401, 403, 404 (and 402 for
  the mock payment); errors return `{ statusCode, message }` via the global
  exception filter — no raw stack traces in responses
- Stock quantity checked server-side before add-to-cart and again at checkout
- Order totals calculated server-side from `priceAtPurchase` snapshots
- Soft delete via `deletedAt` — never hard-delete domain data
- Commit after each feature: "feat: ..." / "fix: ..." / "test: ..."

## API base URL

Frontend calls backend at `http://localhost:8000/api`
(set via `NEXT_PUBLIC_API_URL`). Backend CORS must allow `http://localhost:3001`.

## Response shapes

- Success (most endpoints): `{ success, message, data }`
- Product list `GET /products`: `{ data: Product[], total, page, totalPages }`
- Errors: `{ statusCode, message }`
- Login/signup: `{ accessToken, user }` (inside the `data` envelope)

## Seeded credentials (after `npm run seed` in /ecom-starter)

- Admin: `admin@gmail.com` / `123456`
- Customers: `user1@gmail.com` … `user9@gmail.com` / `123456`
