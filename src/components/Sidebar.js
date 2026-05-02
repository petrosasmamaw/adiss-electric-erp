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
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-transform duration-300 md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700/40">
            <div className="flex items-center gap-2">
              <div className="relative h-9 w-9 overflow-hidden rounded-lg border border-slate-500/40 bg-white">
                <img
                  src="/adiss-logo.png"
                  alt="Adiss Electric logo"
                  className="h-full w-full object-contain p-1"
                />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">{t("nav.team")}</p>
                <p className="font-bold text-sm leading-none">Electric</p>
              </div>
            </div>
            <button className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-700/30">
              <span className="text-lg">⋮</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-0.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onClose?.()}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-slate-700/60 text-white"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/30"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{t(item.label)}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-700/40 text-xs text-slate-400">
            <p>{t("nav.sidebarFooter")}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
