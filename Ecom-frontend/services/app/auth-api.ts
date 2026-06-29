import { baseAPI } from "../base-api";
import type {
  AuthResult,
  AuthUser,
  LoginPayload,
  SignupPayload,
} from "@root/types/auth";
import type { ApiResponse } from "@root/types/product";

/**
 * Auth endpoints, injected into the shared RTK Query baseAPI.
 * Maps to the backend /api/auth routes.
 */
export const authAPI = baseAPI.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse<AuthResult>, LoginPayload>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    signup: builder.mutation<ApiResponse<AuthResult>, SignupPayload>({
      query: (body) => ({ url: "/auth/signup", method: "POST", body }),
    }),
    me: builder.query<ApiResponse<AuthUser>, void>({
      query: () => ({ url: "/auth/me", method: "GET" }),
    }),
  }),
});

export const { useLoginMutation, useSignupMutation, useMeQuery } = authAPI;
