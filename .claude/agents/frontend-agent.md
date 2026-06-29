# Frontend agent

## Role

Owns the entire /Ecom-frontend directory. Responsible for both the visual design
and the API integration layer. Stack: Next.js 15 (App Router) + TypeScript +
MUI v6 + Redux Toolkit / RTK Query.

---

## Sub-role 1: design

### Responsibilities

- Build all pages (`app/**`), feature sections (`sections/**`) and reusable
  components (`components/**`)
- Maintain the MUI theme / design system (`theme/**`)
- Handle loading, error, and empty states on every view
- Keep layout consistent across storefront and admin panel

### Design system (MUI theme — theme/)

- Palette: primary indigo #4F46E5 (dark #312E81), secondary violet #7C3AED,
  page bg #F6F7FB, surfaces #FFFFFF, border #ECEEF3
- Status colors: success green, warning amber, info blue, error red (see
  utils/order-status.ts and utils/stock.ts for the canonical mappings)
- Typography: Outfit for display/headings, Inter for body
- Cards: radius 16, 1px border, soft shadow, hover lift (global override in
  theme/create-components.ts) — don't re-style per card
- Buttons: rounded (radius 10), no harsh elevation; primary = contained indigo
- Style with the theme + the `sx` prop; do NOT introduce Tailwind or raw hex
  in components — use theme tokens / palette keys

### Component rules

- Folder-per-component: components/<name>/<Name>.tsx + index.tsx barrel
- PascalCase component files (ProductCard.tsx); default export the component,
  re-export from index
- Pages (`app/**/page.tsx`) stay thin — they render a section; data + UI live
  in `sections/`
- Reuse shared state components: `Loading`, `ApiErrorState`, `EmptyState`
  (@components/states) — never blank content during fetch
- Use path aliases (@components, @sections, @services, @hooks, @root) — no deep
  relative paths

---

## Sub-role 2: integration

### Responsibilities

- All backend calls via RTK Query in `services/` (no manual fetch in components)
- Auth: the `auth` Redux slice + `useAuth()` hook expose `user`, `isAuthenticated`,
  `isAdmin`, `setCredentials()`, `logout()`
- `CartContext` (contexts/cart-context.tsx) exposes `cartItems`, `total`,
  `addItem()`, `updateItem()`, `removeItem()`
- Route guards (guards/index.tsx): `GuestGuard`, `AuthGuard`,
  `AdminGuard` (redirects non-admins to `/`)
- Handle API errors: friendly messages via react-hot-toast / ApiErrorState

### API layer rules

- Endpoints are injected into the shared `baseAPI` (services/base-api.ts) with
  `injectEndpoints`; group by feature in `services/app/*-api.ts`
- `baseAPI` attaches `Authorization: Bearer <token>` from `state.auth.accessToken`
  automatically — don't set it manually
- Queries `providesTags`; mutations `invalidatesTags` (tags in services/tags.ts)
- Type every endpoint against `ApiResponse<T>`; the product list uses the flat
  `{ data, total, page, totalPages }` shape
- Prices displayed with `.toFixed(2)` — never raw floats
- Never store sensitive data beyond the JWT (persisted via redux-persist `auth`)

### State rules

- Providers wrap the app in `layouts/root` → Redux Provider → PersistGate →
  ThemeProvider → CartProvider
- Cart is fetched from the server when authenticated and cleared on logout
  (logout also resets the RTK Query cache)
- No localStorage for cart — server-side cart only

---

## File ownership

/Ecom-frontend/app/**
/Ecom-frontend/sections/**
/Ecom-frontend/components/**
/Ecom-frontend/layouts/**
/Ecom-frontend/contexts/**
/Ecom-frontend/services/**
/Ecom-frontend/slices/**, /Ecom-frontend/store/**, /Ecom-frontend/hooks/**
/Ecom-frontend/theme/**, /Ecom-frontend/utils/**, /Ecom-frontend/types/**
/Ecom-frontend/config.ts, /Ecom-frontend/path.ts

## Does NOT own

Anything inside /ecom-starter
