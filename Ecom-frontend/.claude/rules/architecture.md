---
paths:
  - "app/**"
  - "layouts/**"
alwaysApply: true
---

# Architecture Rules

Stack: **Next.js 15 (App Router) + React 18 + TypeScript + MUI v6 + Redux
Toolkit + RTK Query + tss-react/Emotion**. This frontend calls the
`ecom-starter` backend (NestJS, base URL `/api`).

## Routing

- App Router with route groups. Protected/app pages live under `app/(app)/`
  and are wrapped by `app/(app)/layout.tsx` -> `DashboardLayout`.
- `/` redirects to `/products` (see `next.config.ts`).
- All route strings come from `path.ts` — never hardcode paths in components.

## Providers

- Root providers are composed in `layouts/root/index.tsx`:
  Emotion cache -> Redux `Provider` -> `PersistGate` -> MUI `ThemeProvider`.
- `app/layout.tsx` loads the Outfit font and renders `<Layout>`.

## Pages vs sections

- Files in `app/**/page.tsx` stay thin: they only render a section component.
- Real UI + data fetching lives in `sections/<feature>/<block>/`.
- Reusable, feature-agnostic UI lives in `components/`.

## Conventions

- File naming: kebab-case folders; component files PascalCase with an
  `index.tsx` re-export barrel.
- Use `import type` for type-only imports.
- Use the path aliases (`@components`, `@services`, `@sections`, `@store`,
  `@theme`, `@types`, `@root`, `@layouts`) — not long relative paths.
