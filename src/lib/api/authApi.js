"use client";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// Log the API URL on the client so deployed builds reveal what endpoint they're using
try {
  // Only run in browsers
  if (typeof window !== "undefined") {
    console.log("AUTH_API_URL:", API_URL);
  }
} catch (e) {
  // ignore
}

// Create base query with dynamic Authorization header
const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    // Get token from Redux state
    const state = getState();
    const token = state.auth?.accessToken;
    
    // Add Authorization header if token exists
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Wrap the raw baseQuery with a timeout to avoid the UI hanging indefinitely
const REQUEST_TIMEOUT_MS = 15000; // 15s
const baseQuery = async (args, api, extraOptions) => {
  let timedOut = false;
  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => {
      timedOut = true;
      resolve({ error: { status: 'TIMEOUT', data: { error: 'Request timed out' } } });
    }, REQUEST_TIMEOUT_MS);
  });

  try {
    const result = await Promise.race([rawBaseQuery(args, api, extraOptions), timeoutPromise]);
    return result;
  } catch (err) {
    if (timedOut) return { error: { status: 'TIMEOUT', data: { error: 'Request timed out' } } };
    return { error: { status: 'NETWORK_ERROR', data: { error: err?.message || 'Network error' } } };
  }
};

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery,
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),
    getSession: builder.query({
      query: () => "/auth/me",
      providesTags: ["Auth"],
    }),
    refresh: builder.mutation({
      query: () => ({
        url: "/auth/refresh",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),
    forgotPassword: builder.mutation({
      query: (email) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: { email },
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ token, password }) => ({
        url: `/auth/reset-password/${token}`,
        method: "POST",
        body: { password },
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetSessionQuery,
  useRefreshMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
