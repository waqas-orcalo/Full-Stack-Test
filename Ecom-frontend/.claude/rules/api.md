---
paths:
  - "services/**"
alwaysApply: true
---

# API / Data-Fetching Rules

All server communication goes through **RTK Query**, mirroring COSMONYX-FE-001.

## Structure

- `services/base-api.ts` — the single `createApi` instance (`baseAPI`). Base URL
  is `config.API_URL`; a Bearer token is attached from `state.auth.accessToken`
  when present.
- `services/tags.ts` — cache tag constants + the `TAGS` array passed to
  `tagTypes`.
- `services/app/<feature>-api.ts` — feature endpoints added via
  `baseAPI.injectEndpoints({ overrideExisting: true, ... })`.

## Endpoint conventions

- Queries `providesTags`; mutations `invalidatesTags` so lists refetch
  automatically after writes.
- Type every endpoint: `builder.query<ApiResponse<T>, Args>`. The backend wraps
  all responses in `{ success, message, data }` — type the envelope, then read
  `response.data`.
- Export the generated hooks (`useGetXQuery`, `useCreateXMutation`, ...) from the
  feature file and consume them in sections.
- Never call `fetch`/`axios` directly inside components.

## Adding a feature API

1. Add a tag in `services/tags.ts`.
2. Create `services/app/<feature>-api.ts` with `injectEndpoints`.
3. Use `providesTags` / `invalidatesTags` with the new tag.
