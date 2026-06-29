# Design skill

Use this when building any new page or component (Next.js App Router + MUI v6).

## Step 1 — States first

Before writing JSX define all four states this view needs, and render them with
the shared components from @components/states:

- loading: `<Loading />` (spinner/skeleton) while fetching
- error: `<ApiErrorState />` (message + retry) if the query fails
- empty: `<EmptyState />` (friendly message + CTA) if the list is empty
- content: the actual data

## Step 2 — Component breakdown

- Page (`app/**/page.tsx`): thin — renders a section, no logic
- Section (`sections/<feature>/...`): fetches via RTK Query hooks, owns state,
  composes layout
- Display components (`components/...`): receive props, purely presentational,
  no data fetching

## Step 3 — Design system check (MUI theme)

Refer to the theme in theme/ and the tokens in frontend-agent.md:

- Use palette keys / theme tokens — no ad-hoc hex in components
- Cards, buttons, chips, tables already have global styles in
  theme/create-components.ts — don't re-style them per instance
- Style with the `sx` prop; never use Tailwind or inline `style={{}}`
- Reuse ProductCard (@components/product-card), status chips via
  utils/order-status.ts and stock badges via utils/stock.ts

## Step 4 — Responsive layout

Use MUI Grid / breakpoints (xs / sm / md / lg):

- Product grid: `<Grid item xs={12} sm={6} md={4}>`
- Admin tables: wrap in a scroll container on small screens
- Use `display: { xs: 'none', md: 'flex' }` to adapt the header/nav

## Common mistakes to avoid

- Forgetting the `key` prop on mapped lists
- Missing loading state causing a layout flash
- Showing a raw price without `.toFixed(2)`
- Hardcoding colors instead of using the theme palette
- Putting data fetching in a presentational component
