"use client";

import { createSlice } from "@reduxjs/toolkit";

const getInitialState = () => {
  try {
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem("accessToken");
      const user = localStorage.getItem("user");
      return {
        user: user ? JSON.parse(user) : null,
        accessToken: accessToken || null,
        isAuthenticated: !!accessToken,
        loading: false,
      };
    }
  } catch (e) {
    // ignore localStorage errors
  }

  return {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    loading: false,
  };
};

const initialState = getInitialState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;
      state.user = user || null;
      state.accessToken = accessToken || null;
      state.isAuthenticated = !!accessToken;
      state.loading = false;

      try {
        if (typeof window !== "undefined") {
          if (accessToken) {
            localStorage.setItem("accessToken", accessToken);
          } else {
            localStorage.removeItem("accessToken");
          }

          if (user) {
            localStorage.setItem("user", JSON.stringify(user));
          } else {
            localStorage.removeItem("user");
          }
        }
      } catch (e) {
        // ignore storage errors
      }
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.loading = false;
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
        }
      } catch (e) {}
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setCredentials, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
