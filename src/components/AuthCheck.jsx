"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { setCredentials, setLoading, logout } from "@/lib/features/authSlice";
import { useGetSessionQuery } from "@/lib/api/authApi";
import AppShell from "./AppShell";

const PUBLIC_ROUTES = ["/login", "/forgot-password", "/reset-password"];

export default function AuthCheck({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, isAuthenticated } = useSelector((state) => state.auth);
  const [hasCheckedSession, setHasCheckedSession] = useState(false);
  
  // Always query on mount to restore session from cookies
  const { data, isLoading, error } = useGetSessionQuery(undefined, {
    skip: false, // Always check session, even if Redux says authenticated
  });

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  useEffect(() => {
    if (isLoading) {
      dispatch(setLoading(true));
      return;
    }

    setHasCheckedSession(true);

    if (data?.user) {
      // Session is valid, update Redux
      dispatch(setCredentials({ user: data.user }));
      // Redirect from login page if already authenticated
      if (isPublicRoute && pathname === "/login") {
        router.push("/dashboard");
      }
    } else if (error) {
      // Session check failed (401), logout
      dispatch(logout());
      if (!isPublicRoute) {
        router.push("/login");
      }
    } else {
      // No session data
      dispatch(setLoading(false));
    }
  }, [data, isLoading, error, dispatch, router, pathname, isPublicRoute]);

  // Show loading state while checking auth
  if (isLoading || !hasCheckedSession) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // If on public route, show page without AppShell
  if (isPublicRoute) {
    return children;
  }

  // If on protected route and authenticated, show with AppShell
  if (isAuthenticated && user) {
    return <AppShell>{children}</AppShell>;
  }

  // Not authenticated and on protected route - will redirect above
  return null;
}
