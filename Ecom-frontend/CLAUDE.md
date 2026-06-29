# CLAUDE.md

Guidance for Claude (and developers) working in this repository.

## Project

**Ecom-frontend** — the admin frontend for the `ecom-starter` backend. It is a
Next.js App Router app that talks to the backend's Products CRUD API. Its
architecture and conventions mirror the reference project **COSMONYX-FE-001**
(Next.js + MUI + Redux Toolkit + RTK Query), scoped down to a clean starter.

It pairs with the `ecom-starter` backend in the sibling folder (NestJS +
MongoDB, served under `/api`).

## Commands

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL
npm run dev          # http://localhost:3001
npm run build        # production build
npm run type-check   # tsc --noEmit
npm run lint
```

The dev server runs on **port 3001** so it doesn't clash with the backend on
3000.

## Stack

Next.js 15 (App Router) · React 18 · TypeScript · MUI v6 · Redux Toolkit +
RTK Query · redux-persist · tss-react/Emotion · React Hook Form + yup ·
react-hot-toast.

## Architecture

```
app/
  layout.tsx              # root: Outfit font + <Layout> providers
  (app)/
    layout.tsx            # DashboardLayout (sidebar + top bar)
    products/
      page.tsx            # -> ProductsList section
      create/page.tsx     # -> ProductForm (create)
      edit/[id]/page.tsx  # -> ProductForm (edit)
layouts/
  root/                   # Emotion -> Redux -> PersistGate -> ThemeProvider
  dashboard/              # app shell
theme/                    # colors, palette, typography, components, theme
store/                    # configureStore + redux-persist + typed hooks
slices/auth/              # minimal auth slice (token for base-api)
services/
  base-api.ts             # RTK Query base (baseUrl = config.API_URL)
  tags.ts                 # cache tags
  app/products-api.ts     # Products endpoints + generated hooks
components/               # reusable UI (custom-button, page-header, rhf, ...)
sections/products/        # products-list, product-form (feature UI + data)
types/                    # entity & DTO types
config.ts                 # API_URL from NEXT_PUBLIC_API_URL
path.ts                   # route constants
```

## Key conventions

- **Pages are thin.** `app/**/page.tsx` only renders a section; data fetching
  and UI live in `sections/`.
- **All API calls via RTK Query.** Add endpoints with `injectEndpoints` in
  `services/app/`; use `providesTags`/`invalidatesTags`. Never call axios/fetch
  in components.
- **Response envelope.** The backend returns `{ success, message, data }` and
  lists as `{ items, total, page, limit, totalPages }`. Type the envelope and
  read `.data`.
- **Routing via `path.ts`** — no hardcoded URLs.
- **Styling via theme + MUI** — tokens in `theme/`, global overrides in
  `theme/create-components.ts`, `sx`/`styled` for the rest.
- **Forms** with React Hook Form + yup and the `@components/rhf` wrappers.
- **File naming** kebab-case folders, PascalCase component files, `index.tsx`
  barrels, `import type` for types, path aliases everywhere.

See `.claude/rules/` for path-scoped rules and `.claude/skills/` for recipes
(`add-feature-crud`, `add-api-endpoint`).

## Backend contract (ecom-starter)

| Method | Path                 | Purpose                |
| ------ | -------------------- | ---------------------- |
| GET    | `/api/products`      | list (page/limit/search/category) |
| GET    | `/api/products/:id`  | get one                |
| POST   | `/api/products`      | create                 |
| PATCH  | `/api/products/:id`  | update                 |
| DELETE | `/api/products/:id`  | soft delete            |
