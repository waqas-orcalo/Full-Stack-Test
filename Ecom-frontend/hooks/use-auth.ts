"use client";

import { useDispatch, useSelector } from "@store/index";
import { authActions } from "@slices/auth";
import type { AuthResult } from "@root/types/auth";

/**
 * Convenience hook over the auth slice: current user, flags, and actions.
 */
export function useAuth() {
  const dispatch = useDispatch();
  const { user, accessToken, isAuthenticated } = useSelector((s) => s.auth);

  return {
    user,
    accessToken,
    isAuthenticated,
    isAdmin: user?.role === "admin",
    setCredentials: (result: AuthResult) =>
      dispatch(authActions.setCredentials(result)),
    logout: () => dispatch(authActions.logout()),
  };
}
