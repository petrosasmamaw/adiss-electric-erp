"use client";

import { configureStore } from "@reduxjs/toolkit";
import erpReducer from "@/lib/features/erpSlice";
import authReducer from "@/lib/features/authSlice";
import { authApi } from "@/lib/api/authApi";

export const store = configureStore({
  reducer: {
    erp: erpReducer,
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware),
});
