"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import AppShell from "./AppShell";

const PUBLIC_ROUTES = ["/login", "/forgot-password", "/reset-password"];

export default function AuthCheck({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, accessToken } = useSelector((state) => state.auth);

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthenticated = !!user && !!accessToken;

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    // If on protected route and not authenticated, redirect to login
    if (!isPublicRoute && !isAuthenticated) {
      router.push("/login");
    }
    // If on login page and authenticated, redirect to dashboard
    if (isPublicRoute && pathname === "/login" && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [mounted, isAuthenticated, pathname, isPublicRoute, router]);

  if (!mounted) return null;

  // If on public route, show page without AppShell
  if (isPublicRoute) {
    return children;
  }

  // If on protected route and authenticated, show with AppShell
  if (isAuthenticated) {
    return <AppShell>{children}</AppShell>;
  }

  // Not authenticated and on protected route - will redirect above
  return null;
}
