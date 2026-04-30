"use client";

export default function Navbar({ t, language, setLanguage, onMenuClick }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/40 bg-white/80 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-6">
        {/* Left: Menu Button + Brand */}
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

          {/* Brand Mark */}
          <div className="hidden md:flex items-center gap-3 rounded-2xl border border-amber-200/70 bg-gradient-to-r from-white via-amber-50 to-sky-50 px-4 py-2.5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 via-blue-500 to-amber-400 text-white shadow-lg shadow-sky-500/20">
              <span className="text-sm font-black tracking-[0.18em]">AE</span>
            </div>
            <div className="leading-none">
              <div className="font-display text-lg font-bold tracking-wide text-slate-900">
                Adiss Electric
              </div>
              <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                Powering smart operations
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
            title={language === "en" ? "Switch to Amharic" : "Switch to English"}
          >
            <span>{language === "en" ? "🇺🇸" : "🇪🇹"}</span>
            <span>{language === "en" ? "EN" : "AM"}</span>
          </button>

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
