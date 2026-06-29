---
name: add-api-endpoint
description: Add a single RTK Query endpoint to an existing feature API
---

# Add API Endpoint Skill

## Usage

```
Use the add-api-endpoint skill to add a '<action>' endpoint to '<feature>'
```

## Steps

1. Open `services/app/<feature>-api.ts`.
2. Add a `builder.query` or `builder.mutation` inside `injectEndpoints`:
   - Type it as `builder.query<ApiResponse<T>, Args>`.
   - Set `url`, `method`, and `params`/`body`.
   - Queries: `providesTags: [<TAG>]`. Mutations: `invalidatesTags: [<TAG>]`.
3. Export the generated hook (`useXxxQuery` / `useXxxMutation`) from the file.
4. Consume the hook in the relevant section; never call axios/fetch directly.

If a new cache tag is needed, add it to `services/tags.ts` first.
