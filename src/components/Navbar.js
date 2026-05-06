"use client";

import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useLogoutMutation } from "@/lib/api/authApi";
import { logout as logoutAction } from "@/lib/features/authSlice";
import { useState } from "react";

export default function Navbar({ t, language, setLanguage, onMenuClick }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const [logout] = useLogoutMutation();
  const [showDropdown, setShowDropdown] = useState(false);

  async function handleLogout() {
    try {
      await logout().unwrap();
      dispatch(logoutAction());
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  const userInitial = user?.email?.charAt(0)?.toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/40 bg-white/80 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-6">
        {/* Left: Menu Button + Brand */}
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-slate-100 rounded-lg transition md:hidden"
            aria-label={t("nav.menu")}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Brand Mark */}
          <div className="hidden md:flex items-center gap-3 rounded-2xl border border-amber-200/70 bg-gradient-to-r from-white via-amber-50 to-sky-50 px-4 py-2.5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
              <img
                src="/adiss-logo.png"
                alt="Adiss Electric logo"
                className="h-full w-full object-contain p-1"
              />
            </div>
            <div className="leading-none">
              <div className="font-display text-lg font-bold tracking-wide text-slate-900">
                Adiss Electric
              </div>
              <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                {t("nav.brandTagline")}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Language Toggle + User */}
        <div className="flex items-center gap-3">
          {/* Language Toggle Button */}
          <button
            onClick={() => setLanguage(language === "en" ? "amh" : "en")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition font-medium text-sm text-slate-700"
            title={language === "en" ? t("nav.switchToAmharic") : t("nav.switchToEnglish")}
          >
            <span>{language === "en" ? "🇺🇸" : "🇪🇹"}</span>
            <span>{language === "en" ? "EN" : "AM"}</span>
          </button>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 pl-3 border-l border-slate-200 hover:opacity-75 transition"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                {userInitial}
              </div>
              <span className="hidden sm:inline text-sm font-medium text-slate-700 max-w-32 truncate">
                {user?.email || t("nav.admin")}
              </span>
              <svg
                className={`w-4 h-4 text-slate-500 transition ${showDropdown ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-200">
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
                    Signed in as
                  </p>
                  <p className="text-sm font-medium text-slate-900 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
