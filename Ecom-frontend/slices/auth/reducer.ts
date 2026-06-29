import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: Record<string, unknown>;
}

const initialState: AuthState = {
  isAuthenticated: false,
  accessToken: null,
  user: {},
};

/**
 * Minimal auth slice mirroring the COSMONYX-FE-001 pattern so base-api can
 * inject a Bearer token. The ecom-starter backend is currently open, but this
 * is wired and persisted, ready for when auth is added.
 */
const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ accessToken: string; user?: Record<string, unknown> }>,
    ) => {
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user ?? {};
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.user = {};
    },
  },
});

export const authActions = slice.actions;
export const authReducer = slice.reducer;
