"use client";

import { useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { useResetPasswordMutation } from "@/lib/api/authApi";

export default function ResetPasswordPage({ params }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useParams();

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError("Both password fields are required");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await resetPassword({ token, password }).unwrap();
      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err?.data?.error || "Failed to reset password");
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-3 md:p-4">
        <div className="relative w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-6 md:p-8 space-y-4 md:space-y-6">
            <div className="text-center space-y-2 md:space-y-4">
              <svg className="w-12 md:w-16 h-12 md:h-16 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2M6.343 3h11.314c.956 0 1.734.778 1.734 1.734v15.532c0 .956-.778 1.734-1.734 1.734H6.343c-.956 0-1.734-.778-1.734-1.734V4.734C4.609 3.778 5.387 3 6.343 3z" />
              </svg>
              <h1 className="text-xl md:text-2xl font-bold text-white">Invalid Reset Link</h1>
              <p className="text-slate-300 text-xs md:text-sm">This password reset link is invalid or has expired.</p>
              <Link
                href="/forgot-password"
                className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-2 md:py-3 px-4 md:px-6 rounded-lg transition-all duration-200 text-sm md:text-base"
              >
                Request New Link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-3 md:p-4">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-6 md:p-8 space-y-4 md:space-y-6">
          {/* Header */}
          <div className="text-center space-y-1 md:space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Create New Password</h1>
            <p className="text-slate-300 text-xs md:text-sm">Set a strong password for your account</p>
          </div>

          {success ? (
            <div className="space-y-4 md:space-y-6">
              <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3 md:p-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <svg className="h-5 md:h-6 w-5 md:w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-green-200 text-xs md:text-sm font-medium">Password reset successfully!</p>
                </div>
              </div>
              <p className="text-center text-slate-400 text-xs md:text-sm">Redirecting to login...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 md:p-4">
                  <p className="text-red-200 text-xs md:text-sm font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                {/* Password Input */}
                <div>
                  <label htmlFor="password" className="block text-xs md:text-sm font-medium text-slate-200 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 md:px-4 py-2 md:py-3 bg-white/5 border border-white/20 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1 md:mt-2">Minimum 8 characters</p>
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-xs md:text-sm font-medium text-slate-200 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 md:px-4 py-2 md:py-3 bg-white/5 border border-white/20 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 md:py-3 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 text-sm md:text-base"
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </button>
              </form>

              <div className="text-center">
                <Link href="/login" className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
