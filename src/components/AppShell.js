"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-200/20 blur-3xl animate-pulse" />
        <div
          className="absolute top-1/2 -left-40 h-80 w-80 rounded-full bg-amber-200/20 blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute -bottom-20 right-1/4 h-96 w-96 rounded-full bg-purple-200/10 blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative flex min-h-screen">
        <Sidebar t={t} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex min-w-0 flex-1 flex-col md:pl-72">
          <Navbar
            t={t}
            language={language}
            setLanguage={setLanguage}
            onMenuClick={() => setSidebarOpen((prev) => !prev)}
          />

          <main className="flex-1 overflow-auto px-4 py-6 md:px-6 md:py-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>

          <footer className="border-t border-slate-200/40 bg-white/30 px-4 py-4 text-center text-xs text-slate-500 backdrop-blur-sm md:px-6">
            <p>{t("nav.footer")}</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
