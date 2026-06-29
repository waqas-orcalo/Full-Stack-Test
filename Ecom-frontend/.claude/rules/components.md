---
paths:
  - "components/**"
  - "sections/**"
  - "theme/**"
alwaysApply: true
---

# Component & Styling Rules

## Folder-per-component

Each component is a folder: `components/<name>/<Name>.tsx` plus an `index.tsx`
barrel that re-exports it. Import from the folder, e.g.
`import { Button } from "@components/custom-button"` or from the
`@components/index` barrel.

## Styling

- Use MUI components and the theme. Style via the `sx` prop or
  `styled(...)` from `@mui/material/styles` (as in `custom-button`).
- Global look (radius, button shape, card borders, table head) is centralised in
  `theme/create-components.ts` — prefer extending the theme over repeating styles.
- Colours/tokens live in `theme/colors.ts` and the palette in
  `theme/create-palette.ts`. Don't hardcode hex values in components.

## Forms

- React Hook Form + yup (`@hookform/resolvers/yup`).
- Bind inputs with the `@components/rhf` wrappers (`RHFTextField`) inside a
  `FormProvider`; surface server errors via `react-hot-toast`.

## Data states

- Every data view handles loading / error / empty using
  `Loading`, `ApiErrorState`, `EmptyState` from `@components/states`.
