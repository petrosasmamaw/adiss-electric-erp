"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";

export default function ChartCard({ title, subtitle, icon: Icon, children, className = "" }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Card variant="elevated" className={`p-5 sm:p-6 ${className}`}>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          {subtitle ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
        </div>
        {Icon ? (
          <div className="rounded-lg bg-slate-100 p-2 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <Icon size={16} />
          </div>
        ) : null}
      </div>

      {mounted ? (
        <div className="h-[280px] w-full" style={{ minWidth: 0, minHeight: 0 }}>{children}</div>
      ) : (
        <div className="h-[280px] w-full flex items-center justify-center text-sm text-slate-400">Loading chart...</div>
      )}
    </Card>
  );
}
