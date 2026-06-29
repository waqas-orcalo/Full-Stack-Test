"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@hooks/use-auth";
import { paths } from "@root/path";
import { Loading } from "@components/states";

/**
 * GuestGuard — only for logged-out users (login/signup pages).
 * Authenticated users are bounced to their home surface by role.
 */
export function GuestGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(isAdmin ? paths.admin.dashboard : paths.products.base);
    }
  }, [isAuthenticated, isAdmin, router]);

  if (isAuthenticated) return <Loading label="Redirecting…" />;
  return <>{children}</>;
}

/**
 * AuthGuard — requires any authenticated user. Redirects to login otherwise,
 * preserving the intended destination via ?redirect=.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      const next =
        typeof window !== "undefined" ? window.location.pathname : "";
      router.replace(`${paths.auth.login}?redirect=${encodeURIComponent(next)}`);
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return <Loading label="Checking access…" />;
  return <>{children}</>;
}

/**
 * AdminGuard — requires an authenticated admin. Customers are sent to the store.
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(paths.auth.login);
    } else if (!isAdmin) {
      router.replace(paths.products.base);
    }
  }, [isAuthenticated, isAdmin, router]);

  if (!isAuthenticated || !isAdmin) return <Loading label="Checking access…" />;
  return <>{children}</>;
}
