"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const links = [
    { href: "/dashboard", label: t("nav.dashboard") },
    { href: "/store", label: t("nav.store") },
    { href: "/buy", label: t("nav.buy") },
    { href: "/sell", label: t("nav.sell") },
    { href: "/balance", label: t("nav.balance") },
    { href: "/reports", label: t("nav.reports") },
  ];

  const isActive = (href) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="relative min-h-screen overflow-x-clip text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(248,250,252,0.92),rgba(241,245,249,0.94))]" />
      <div className="pointer-events-none absolute left-[-80px] top-[-120px] h-72 w-72 rounded-full bg-blue-300/25 blur-3xl" />
      <div className="pointer-events-none absolute right-[-40px] top-[120px] h-64 w-64 rounded-full bg-amber-300/25 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/70 to-transparent" />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 md:px-8 md:py-6">
        <header className="sticky top-3 z-30 rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-2xl shadow-slate-200/60 backdrop-blur-xl md:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[linear-gradient(140deg,#2563eb,#facc15)] text-lg font-extrabold text-slate-950 shadow-lg shadow-blue-900/20">
                E
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.32em] text-slate-500">{t("nav.appName")}</p>
                <h1 className="font-display text-2xl leading-tight text-slate-900 md:text-3xl">{t("nav.panelTitle")}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-blue-200 md:inline-flex"
                onClick={() => setLanguage((prev) => (prev === "en" ? "amh" : "en"))}
                aria-label={t("nav.language")}
              >
                {language === "en" ? t("nav.amharic") : t("nav.english")}
              </button>

              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 md:hidden"
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                {menuOpen ? t("nav.close") : t("nav.menu")}
              </button>
            </div>
          </div>

          <p className="mt-3 hidden max-w-2xl text-sm text-slate-600 md:block">
            {t("nav.panelSubtitle")}
          </p>

          <nav className={`mt-4 ${menuOpen ? "block" : "hidden"} md:block`}>
            <div className="mb-3 md:hidden">
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-blue-200"
                onClick={() => setLanguage((prev) => (prev === "en" ? "amh" : "en"))}
                aria-label={t("nav.language")}
              >
                {language === "en" ? t("nav.amharic") : t("nav.english")}
              </button>
            </div>
            <div className="flex flex-wrap gap-2 md:gap-2.5">
            {links.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition duration-200 ${
                    active
                      ? "bg-[linear-gradient(135deg,#2563eb,#facc15)] text-slate-950 shadow-md shadow-blue-900/20"
                      : "bg-white text-slate-700 ring-1 ring-slate-200 hover:-translate-y-[1px] hover:bg-blue-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            </div>
          </nav>
        </header>

        <main className="pb-8">{children}</main>
      </div>
    </div>
  );
}
