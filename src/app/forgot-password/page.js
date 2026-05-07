"use client";

import { useState } from "react";
import Link from "next/link";
import { useForgotPasswordMutation } from "@/lib/api/authApi";

export default function ForgotPasswordPage() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      await forgotPassword(email).unwrap();
      setSubmitted(true);
      setEmail("");
    } catch (err) {
      setError(err?.data?.error || "Failed to process request");
    }
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
            <h1 className="text-2xl md:text-3xl font-bold text-white">Reset Password</h1>
            <p className="text-slate-300 text-xs md:text-sm">
              {submitted ? "Check your email for reset instructions" : "Enter your email to receive password reset instructions"}
            </p>
          </div>

          {submitted ? (
            <div className="space-y-4 md:space-y-6">
              <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3 md:p-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="flex-shrink-0">
                    <svg className="h-5 md:h-6 w-5 md:w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-green-200 text-xs md:text-sm">
                      If an account exists with this email, you'll receive a reset link shortly.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-slate-400 text-xs md:text-sm mb-4">Check your email and follow the instructions to reset your password.</p>
                <Link
                  href="/login"
                  className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 md:py-3 px-4 md:px-6 rounded-lg transition-all duration-200 text-sm md:text-base"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 md:p-4">
                  <p className="text-red-200 text-xs md:text-sm font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                <div>
                  <label htmlFor="email" className="block text-xs md:text-sm font-medium text-slate-200 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3 md:px-4 py-2 md:py-3 bg-white/5 border border-white/20 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 md:py-3 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 text-sm md:text-base"
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <div className="text-center">
                <Link href="/login" className="text-blue-400 hover:text-blue-300 text-xs md:text-sm font-medium transition-colors">
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
