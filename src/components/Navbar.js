"use client";

import { useState } from "react";

export default function Navbar({ t, language, setLanguage, onMenuClick }) {
  const [showLangMenu, setShowLangMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/40 bg-white/80 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-6">
        {/* Left: Menu Button + Search */}
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-slate-100 rounded-lg transition md:hidden"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Search Bar */}
          <div className="hidden md:flex items-center gap-2 flex-1 max-w-sm px-4 py-2.5 rounded-xl bg-slate-100/50 border border-slate-200">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder={t("nav.search") || "Search..."}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Right: Language + User */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 transition text-sm font-medium"
            >
              {language === "en" ? "🇺🇸 EN" : "🇪🇹 AM"}
            </button>
            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                <button
                  onClick={() => {
                    setLanguage("en");
                    setShowLangMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm"
                >
                  🇺🇸 English
                </button>
                <button
                  onClick={() => {
                    setLanguage("am");
                    setShowLangMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm border-t border-slate-100"
                >
                  🇪🇹 Amharic
                </button>
              </div>
            )}
          </div>

          {/* User Avatar */}
          <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
              A
            </div>
            <span className="hidden sm:inline text-sm font-medium text-slate-700">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
