# Ecom Frontend

Admin frontend for the **ecom-starter** backend — a Next.js App Router app that
manages the Products catalogue via the backend's CRUD API. Architecture,
folder structure, API layer, and component styling mirror the reference project
**COSMONYX-FE-001** (Next.js + MUI + Redux Toolkit + RTK Query).

## Stack

Next.js 15 (App Router) · React 18 · TypeScript · Material-UI v6 ·
Redux Toolkit + RTK Query · redux-persist · React Hook Form + yup ·
react-hot-toast · tss-react/Emotion.

## Prerequisites

The backend must be running first. In the sibling `ecom-starter` folder:

```bash
npm install
npm run start:dev      # backend on http://localhost:8000/api
```

## Getting started

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env.local
#    NEXT_PUBLIC_API_URL should point at the backend, e.g. http://localhost:8000/api

# 3. Run (dev server on port 3001 to avoid clashing with the backend)
npm run dev
```

Open http://localhost:3001 — `/` redirects to `/products`.

## Features

- **Products list** — paginated table with search, edit and delete (with
  confirmation dialog).
- **Create / Edit product** — React Hook Form + yup validation.
- Loading, empty, and API-error states throughout.
- RTK Query cache invalidation, so lists refresh automatically after writes.

## Project structure

```
app/(app)/products/   # routes (list, create, edit/[id]) — thin pages
sections/products/    # feature UI: products-list, product-form
components/           # reusable UI (custom-button, page-header, rhf, states...)
services/             # RTK Query base-api + tags + app/products-api
store/ + slices/      # Redux store (redux-persist) + auth slice
theme/                # MUI theme (colors, palette, typography, components)
config.ts / path.ts   # API base URL + route constants
```

## Scripts

```bash
npm run dev          # dev server (port 3001)
npm run build        # production build
npm run start        # serve production build (port 3001)
npm run type-check   # tsc --noEmit
npm run lint
```

## Configuration

| Variable               | Description                                  |
| ---------------------- | -------------------------------------------- |
| `NEXT_PUBLIC_API_URL`  | Backend API base URL (default `http://localhost:8000/api`) |
| `NEXT_PUBLIC_FE_URL`   | Public URL of this app (default `http://localhost:3001`)   |

See `CLAUDE.md` and `.claude/` for conventions and contributor recipes.
