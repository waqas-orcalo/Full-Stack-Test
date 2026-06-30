# NOTES

Mini e-commerce platform — a single **NestJS + MongoDB** backend (`ecom-starter`)
serving a **Next.js (App Router) + MUI** storefront and admin panel
(`Ecom-frontend`), built through an agentic workflow.

- Backend: `ecom-starter` — NestJS + Mongoose, JWT auth, REST API on `:8000` (prefix `/api`), Swagger at `/docs`.
- Frontend: `Ecom-frontend` — Next.js 15, TypeScript, MUI v6, Redux Toolkit + RTK Query, redux-persist. Runs on `:3001`.
- Design reference: `design/ecommerce-ui-design.html`.
- Deeper docs: `ecom-starter/docs/` (`API_JOURNEY.md`, `ARCHITECTURE.md`, `SCHEMA.md`, `schema.mermaid`).

---

## 1. Stack choice & why

- **NestJS** — opinionated module/DI structure makes a DTO-first, guard-based,
  testable API natural; first-class class-validator + Passport + Swagger.
- **MongoDB (Mongoose)** — fast to model an evolving catalog/cart/order shape
  without migrations; embedded subdocuments fit cart/order line items well.
- **Next.js App Router + MUI + RTK Query** — App Router for clean route-group
  separation (public / auth / admin); MUI as themeable component primitives
  (the look/layout is custom, not a template); RTK Query for typed data fetching,
  caching, and automatic refetch on mutations.
- **JWT auth** — stateless, simple to enforce per-route, and easy to carry the
  role for RBAC.

---

## 2. Agent workflow — tooling, scoping, context

**Tool.** Built with an agent-driven workflow (Claude / Cursor-style agent mode):
I described features in plain language and the agent implemented them across the
two projects; I steered, reviewed, and corrected at each step rather than
hand-writing code.

**Project context I gave the agent (the most important lever):**
- `CLAUDE.md` (repo root) — the persistent context every task starts from:
  stack, folder layout, ports, response shapes, seeded creds, and the **shared
  rules** (never commit `.env`, bcrypt passwords, correct HTTP status codes, no
  stack traces, server-side stock + totals, soft delete, commit message format).
- `.claude/agents/frontend-agent.md` and `backend-agent.md` — role definitions
  with **explicit file ownership** (`frontend-agent` owns `/Ecom-frontend`,
  `backend-agent` owns `/ecom-starter`, with "does NOT own" boundaries) and
  sub-roles (design/integration, api/testing).
- `.claude/skills/**` — reusable step-by-step playbooks: `api-skill`
  (schema → DTO → service → controller → module wiring), `testing-skill`
  (in-memory Mongo + a fixed 5-test pattern), `design-skill` (states-first →
  component breakdown → theme), `integration-skill` (RTK Query endpoint → auto
  auth header → error handling).

**How I scoped tasks.** One vertical slice at a time, in the spec's suggested
order, so the app stayed runnable end-to-end:
scaffold → auth (JWT + roles) → products read paths → cart → checkout/orders →
admin (orders, dashboard) → suggestions → categories → hardening → polish.
Each slice was scoped as a small, verifiable instruction (e.g. "implement the
products list with search/category/price/sort/pagination and the `{data,total,
page,totalPages}` shape") rather than "build the whole store."

**How I managed context.** The `CLAUDE.md` + agent/skill files meant I rarely had
to re-explain conventions; I pointed the agent at the relevant skill and let the
checklist drive consistency (DTO-first, guards, envelope, soft delete, states).
When the spec sharpened a contract later (exact `GET /products` query params and
response shape, `PUT` + qty≤0-removes for cart), I had the agent refactor to the
precise contract instead of leaving the earlier approximation.

**Honest note on "multi-agent."** In this session a single orchestrating agent
did the work following these role/skill docs; the agent and skill files encode
the intended division of labor and the conventions actually used, and make the
repo ready for a true parallel frontend-agent/backend-agent workflow (clear,
non-conflicting file ownership). Where the original template docs didn't match
reality (Tailwind/TypeORM/Postgres placeholders), I rewrote them to the real
stack so they wouldn't mislead.

---

## 3. Where the agent helped, and where it got things wrong

**Helped most:** boilerplate-heavy, pattern-driven work — Mongoose
schemas/DTOs/services/controllers, RTK Query endpoints + generated hooks, MUI
sections, and wiring it all together quickly and consistently.

**Mistakes I caught and corrected (the important part):**

1. **Wrong response shape vs spec.** The first products list returned the app
   envelope `{success,message,data:{items,…}}`. The spec required top-level
   `{ data, total, page, totalPages }`. Fix: a `TransformInterceptor` that
   passes paginated payloads through unwrapped, and the frontend types updated to
   the flat shape.
2. **Case-mismatch broke category filtering.** Category pills were a hardcoded
   lowercase list (`audio`) while products/categories stored `Audio`, so the
   filter silently returned nothing. Caught by clicking a pill; fixed by driving
   the pills from the categories API (exact names).
3. **`stock` vs `stockQuantity`.** The spec names the field `stockQuantity`;
   early code used `stock`. Renamed across schema, DTO, seed, and all frontend
   readers to match the contract.
4. **Cart update semantics.** Update used `PATCH` and rejected `quantity ≤ 0`;
   the spec wanted `PUT` and "≤ 0 removes the item." Corrected on both ends.
5. **Duplicate React key.** The theme-swatch list keyed by color hex; the
   Graphite preset reuses `#111827` for two swatches → console error. Fixed by
   keying on index.
6. **Dead UI controls.** A decorative heart icon and a non-functional header
   search were carried over from the design mock; I had them removed/implemented
   rather than left as fake controls.
7. **Doc/template drift.** The agent first generated `CLAUDE.md` and agent/skill
   files describing a Postgres/TypeORM/Tailwind stack (generic template). I
   rewrote them to the actual MongoDB/Mongoose/MUI/RTK Query stack.
8. **Checkout atomicity overstated.** An agent-written doc claimed the checkout
   was transactional; MongoDB standalone has no multi-doc transactions, so I
   corrected the claim and the approach (re-validate stock immediately before
   commit) — see trade-offs.

---

## 4. Supervision & verification

- **Read every change** before accepting it; treated agent output as a draft, not
  truth.
- **Type-checking / builds.** Verified TypeScript/`nest build` and `tsc --noEmit`
  on a clean local disk during development. (Note: the agent's sandbox file mount
  intermittently corrupted files on read, which blocked some in-tooling builds;
  those were re-run on clean copies and by manual review — final verification
  should be a clean clone + build in your own environment.)
- **Edge-case checks** mapped to the spec: add-to-cart/checkout over stock → 400
  (stock not decremented); customer hitting an admin route → 403; non-owner
  fetching another user's order → 403; bad payment token → 402; bad/unknown id →
  404 not 500.
- **A final read-only audit pass** over both projects looking for redundant code,
  unsafe casts, missing guards, and inconsistent response shapes.
- **Tests:** a unit spec for `ProductsService` (duplicate-SKU conflict,
  SKU normalization, not-found on remove). This is the thinnest area — see
  trade-offs.

---

## 5. Design workflow

- **Design-first.** Before building UI, I directed a design agent to produce a
  single, navigable **HTML design reference** (`design/ecommerce-ui-design.html`)
  establishing a deliberate visual system rather than a downloaded template:
  modern-minimal, light, an indigo→violet accent on neutral surfaces, Outfit
  (display) + Inter (body), 16px rounded cards, soft shadows, and a consistent
  status-color language (amber/blue/violet/green/red).
- **Iteration.** I iterated on layout and look across screens (storefront top
  bar, split-screen auth, deep-indigo admin shell, product/cart/checkout, the
  admin dashboard), then built the live app to match. MUI provides the component
  primitives; the theme (`theme/`), layout, and composition are custom.
- **Made it a product feature.** The design system is exposed as **5 enterprise
  theme presets** (admin Settings + a customer account-menu picker) that restyle
  the whole app via a persisted Redux preset and a dynamic MUI theme.

---

## 6. Assumptions (ambiguous decisions documented)

- **Open-ended "relevant suggestions":** interpreted as **content-based,
  category-matched** products. `GET /products/:id/suggestions` returns up to 4
  active products in the same category, excluding the viewed product and — when
  authenticated — anything the user has already ordered, newest-first. *With more
  time I would implement collaborative filtering based on co-purchase patterns.*
- **Roles:** self-service signup always creates a `customer`; admins are seeded
  (or promoted in DB). No self-registration as admin.
- **Product images:** uploaded to **disk** (`ecom-starter/images`, served at
  `/images/*`) and referenced by `imageUrl`; the admin form uploads a file. The
  seed downloads a real category photo per product at run time (falls back to a
  generated placeholder offline).
- **Payment:** clearly **mocked** — `paymentToken === "tok_test_success"`
  succeeds, anything else returns `402`. No real/Stripe integration.
- **Order status lifecycle:** `pending → processing → shipped → delivered`, with
  `cancelled` reachable from `pending`/`processing`; transitions validated
  server-side.
- **Response/error contracts:** success uses `{ success, message, data }`; the
  product list uses the spec's flat `{ data, total, page, totalPages }`; errors
  use `{ statusCode, message }`.
- **Ports/CORS:** backend `:8000` (`/api`), frontend `:3001`; backend CORS must
  allow the frontend origin (`CORS_ORIGINS`).
- **Seeded credentials:** admin `admin@gmail.com` / `123456`; customers
  `user1@gmail.com … user9@gmail.com` / `123456`.

---

## 7. Trade-offs & scope

**Built fully:** auth (JWT + RBAC), product catalog with all
filter/sort/pagination, product detail, server-side persistent cart with stock
guards, checkout + order creation with `priceAtPurchase` snapshots, order
history, admin product/category/order management, order-status lifecycle, admin
dashboard with KPIs + charts (sales bar, status donut, top products), product
suggestions, validation (client + server), consistent error handling, security
(bcrypt, `select:false` password hash, guards, secrets in env), seed script,
and theme presets.

**Mocked / simplified:**
- **Payment** is a mock token (no Stripe), and **checkout has no shipping form** —
  it's a single "Pay now" step.
- **Checkout is not atomic.** MongoDB standalone has no multi-document
  transactions, so the create-order → decrement-stock → clear-cart sequence
  isn't wrapped in one commit; stock is re-validated immediately before commit
  to keep it correct in practice. *With more time / a replica set I'd use a
  Mongo session/transaction.*
- **Tests are light** — one unit spec. *With more time I'd add the priority E2E
  suite (auth happy/401, admin route 403, stock→400 with no decrement,
  order-total = Σ qty×priceAtPurchase, cart persistence) using
  `mongodb-memory-server`, per `docs`/the testing-skill.*
- **Category↔Product** is a soft reference by name (string), not an ObjectId FK —
  simpler for the catalog; a hard reference would be more robust.

**What I'd do next with more time:** the E2E tests above; a Mongo replica set +
transactional checkout; Stripe test-mode payment + a shipping form; collaborative
-filtering suggestions; image optimization/CDN; and tightening commit messages to
the `feat:/fix:/test:` convention throughout.

---

## 8. Running it (summary — see READMEs for full detail)

1. **MongoDB** running locally (or set `MONGODB_URI`).
2. **Backend:** `cd ecom-starter` → `npm install` → copy `.env.example` to `.env`
   (set `MONGODB_URI`, `JWT_SECRET`, ensure `CORS_ORIGINS` includes
   `http://localhost:3001`) → `npm run seed` → `npm run start:dev` (`:8000/api`).
3. **Frontend:** `cd Ecom-frontend` → `npm install` → `npm run dev` (`:3001`).
4. Log in as **admin@gmail.com / 123456** (admin panel) or
   **user1@gmail.com / 123456** (storefront).
