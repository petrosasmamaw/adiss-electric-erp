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
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-72 overflow-hidden border-r border-white/10 bg-slate-950 text-white transition-transform duration-500 md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(248,113,113,0.30),transparent_36%),radial-gradient(circle_at_85%_20%,rgba(56,189,248,0.22),transparent_34%),radial-gradient(circle_at_40%_78%,rgba(251,191,36,0.18),transparent_40%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(2,6,23,0.78)_0%,rgba(15,23,42,0.90)_48%,rgba(2,6,23,0.98)_100%)]" />
          <div className="absolute -top-24 left-8 h-44 w-44 rounded-full bg-rose-500/20 blur-3xl animate-pulse" />
          <div
            className="absolute top-1/3 -right-10 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl animate-pulse"
            style={{ animationDelay: "1.2s" }}
          />
          <div
            className="absolute bottom-8 left-6 h-36 w-36 rounded-full bg-amber-300/20 blur-3xl animate-pulse"
            style={{ animationDelay: "2.1s" }}
          />
        </div>

        <div className="relative z-10 flex h-full flex-col">
          <div className="border-b border-white/10 px-5 py-5">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 shadow-[0_14px_34px_rgba(0,0,0,0.32)] backdrop-blur-xl">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative h-11 w-11 overflow-hidden rounded-xl border border-white/30 bg-white/95 shadow-lg shadow-black/20">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
                  <img
                    src="/adiss-logo.png"
                    alt="Adiss Electric logo"
                    className="h-full w-full object-contain p-1"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-300">{t("nav.team")}</p>
                  <p className="truncate font-display text-sm font-bold tracking-[0.08em] text-white">Adiss Electric</p>
                  <p className="mt-0.5 truncate text-[10px] font-medium uppercase tracking-[0.18em] text-slate-300/85">{t("nav.brandTagline")}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onClose?.()}
                className="rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-xs font-bold text-slate-200 transition hover:bg-white/15 hover:text-white md:hidden"
                aria-label={t("nav.menu")}
              >
                X
              </button>
              <div className="hidden h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-slate-300 md:flex">
                <span className="text-lg">...</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-6">
            <div className="mb-4 px-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">Navigation</p>
            </div>

            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onClose?.()}
                    className={`group relative flex items-center gap-3 overflow-hidden rounded-xl border px-3 py-3 text-sm font-semibold transition-all duration-300 ${
                      active
                        ? "translate-x-1 border-cyan-300/30 bg-gradient-to-r from-cyan-400/25 via-sky-400/20 to-transparent text-white shadow-[0_10px_24px_rgba(56,189,248,0.20)]"
                        : "border-white/10 bg-white/5 text-slate-200 hover:translate-x-1.5 hover:border-white/25 hover:bg-white/12 hover:text-white"
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-cyan-300 to-blue-400 animate-pulse" />
                    )}

                    <div
                      className={`relative z-10 grid h-9 w-9 place-items-center rounded-lg border transition-all duration-300 ${
                        active
                          ? "border-cyan-200/40 bg-cyan-300/20 text-white shadow-[0_0_20px_rgba(56,189,248,0.30)]"
                          : "border-white/12 bg-white/10 text-slate-200 group-hover:scale-110 group-hover:rotate-6 group-hover:border-white/30 group-hover:bg-white/15"
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                    </div>

                    <span className="relative z-10 tracking-[0.02em]">{t(item.label)}</span>

                    <span
                      className={`relative z-10 ml-auto h-2 w-2 rounded-full transition-all duration-300 ${
                        active ? "bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.95)]" : "bg-slate-500/50 group-hover:bg-slate-200/80"
                      }`}
                    />
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-white/10 px-5 py-4">
            <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs font-medium tracking-wide text-slate-300">{t("nav.sidebarFooter")}</p>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.9)]" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">ERP Panel</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
