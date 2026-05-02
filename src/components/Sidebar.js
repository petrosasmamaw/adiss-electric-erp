"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  Wallet,
  BarChart3,
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "nav.dashboard", href: "/dashboard" },
  { icon: Package, label: "nav.store", href: "/store" },
  { icon: ShoppingCart, label: "nav.buy", href: "/buy" },
  { icon: TrendingUp, label: "nav.sell", href: "/sell" },
  { icon: Wallet, label: "nav.balance", href: "/balance" },
  { icon: BarChart3, label: "nav.reports", href: "/reports" },
];

export default function Sidebar({ t, isOpen, onClose }) {
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-700/35 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-72 overflow-hidden border-r border-slate-300 bg-gradient-to-b from-slate-100 via-slate-50 to-slate-200 text-slate-800 transition-transform duration-500 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(56,189,248,0.14),transparent_36%),radial-gradient(circle_at_85%_20%,rgba(148,163,184,0.18),transparent_34%),radial-gradient(circle_at_40%_78%,rgba(59,130,246,0.12),transparent_40%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(165deg,rgba(248,250,252,0.80)_0%,rgba(241,245,249,0.72)_48%,rgba(226,232,240,0.86)_100%)]" />
          <div className="absolute -top-24 left-8 h-44 w-44 rounded-full bg-sky-300/25 blur-3xl animate-pulse" />
          <div
            className="absolute top-1/3 -right-10 h-40 w-40 rounded-full bg-slate-300/35 blur-3xl animate-pulse"
            style={{ animationDelay: "1.2s" }}
          />
          <div
            className="absolute bottom-8 left-6 h-36 w-36 rounded-full bg-blue-200/30 blur-3xl animate-pulse"
            style={{ animationDelay: "2.1s" }}
          />
        </div>

        <div className="relative z-10 flex h-full flex-col">
          <div className="border-b border-slate-300 px-5 py-5">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-300 bg-white/80 p-3 shadow-[0_10px_24px_rgba(15,23,42,0.08)] backdrop-blur-md">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative h-11 w-11 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
                  <img
                    src="/adiss-logo.png"
                    alt="Adiss Electric logo"
                    className="h-full w-full object-contain p-1"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">{t("nav.team")}</p>
                  <p className="truncate font-display text-sm font-bold tracking-[0.08em] text-slate-900">Adiss Electric</p>
                  <p className="mt-0.5 truncate text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">{t("nav.brandTagline")}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onClose?.()}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 md:hidden"
                aria-label={t("nav.menu")}
              >
                X
              </button>
              <div className="hidden h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-500 md:flex">
                <span className="text-lg">...</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-5 py-5">
            <div className="mb-4 px-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">Navigation</p>
            </div>

            <div className="space-y-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onClose?.()}
                    className={`group relative flex items-center gap-3 px-2 py-2 text-sm font-semibold transition-all duration-300 ${
                      active
                        ? "translate-x-1 text-slate-900"
                        : "text-slate-600 hover:translate-x-1 hover:text-slate-900"
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-sky-500 to-blue-600" />
                    )}

                    <Icon className={`h-5 w-5 shrink-0 transition-all duration-300 ${active ? "text-blue-600" : "text-slate-500 group-hover:text-slate-700 group-hover:scale-110"}`} />

                    <span className="relative z-10 tracking-[0.02em]">{t(item.label)}</span>

                    <span
                      className={`relative z-10 ml-auto h-2 w-2 rounded-full transition-all duration-300 ${
                        active ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.65)]" : "bg-slate-400/70 group-hover:bg-slate-500"
                      }`}
                    />
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-slate-300 px-5 py-4">
            <div className="px-1 py-2">
              <p className="text-xs font-medium tracking-wide text-slate-600">{t("nav.sidebarFooter")}</p>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">ERP Panel</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
