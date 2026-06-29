// RTK Query
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Store + configuration
import { config } from "@root/config";
import { TAGS } from "./tags";
import type { RootState } from "@store/index";

// Base query: points at the backend API and injects a Bearer token when present
// (mirrors COSMONYX-FE-001 base-api). The ecom-starter backend is currently
// unauthenticated, so the header is simply omitted when no token is set.
const baseQuery = fetchBaseQuery({
  baseUrl: config.API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseAPI = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: TAGS,
  endpoints: () => ({}),
});
