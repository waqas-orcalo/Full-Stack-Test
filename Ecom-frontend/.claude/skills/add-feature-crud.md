---
name: add-feature-crud
description: Add a new CRUD feature (API service, sections, pages) wired to the backend
---

# Add Feature CRUD Skill

Scaffold a new resource end-to-end, following the Products feature as the
template.

## Usage

```
Use the add-feature-crud skill to add a '<feature>' feature
```

## Steps

1. **Types**: `types/<feature>.ts` — entity, payload, query, and reuse
   `ApiResponse<T>` / paginated shapes.
2. **API**: add a tag in `services/tags.ts`, then
   `services/app/<feature>-api.ts` using `baseAPI.injectEndpoints` with
   get/getById/create/update/delete and `providesTags`/`invalidatesTags`.
   Export the generated hooks.
3. **Sections**: `sections/<feature>/<feature>-list/` (table + search +
   pagination + delete confirm) and `sections/<feature>/<feature>-form/`
   (RHF + yup, shared create/edit).
4. **Routes**: under `app/(app)/<feature>/` add `page.tsx` (list),
   `create/page.tsx`, and `edit/[id]/page.tsx`. Keep pages thin — render the
   section only.
5. **Paths**: add the routes to `path.ts` and a nav item in
   `layouts/dashboard/index.tsx`.

## Conventions

- Pages thin, sections do the work, components are reusable.
- All fetching via RTK Query hooks; handle loading/error/empty states.
- kebab-case folders, `index.tsx` barrels, path aliases, `import type`.
