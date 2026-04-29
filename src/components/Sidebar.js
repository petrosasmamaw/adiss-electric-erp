"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const menuItems = [
  { icon: "📊", label: "nav.dashboard", href: "/dashboard" },
  { icon: "📦", label: "nav.store", href: "/store" },
  { icon: "🛍️", label: "nav.buy", href: "/buy" },
  { icon: "💰", label: "nav.sell", href: "/sell" },
  { icon: "⚖️", label: "nav.balance", href: "/balance" },
  { icon: "📈", label: "nav.reports", href: "/reports" },
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
          <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-700/50">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-blue-400 to-amber-300 text-slate-900 font-bold text-lg">
              E
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">ERP</p>
              <p className="font-semibold text-sm">Electric</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onClose?.()}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive(item.href)
                    ? "bg-blue-500/20 text-blue-200 border border-blue-400/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{t(item.label)}</span>
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-700/50 text-xs text-slate-400">
            <p>© 2026 Electric ERP</p>
          </div>
        </div>
      </aside>
    </>
  );
}
