"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function DataTable({ columns, data, className = "", striped = true, rowClassName }) {
  const { t } = useLanguage();

  return (
    <div className="overflow-x-auto">
      <table className={`w-full min-w-max text-left text-sm ${className}`}>
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/50 sticky top-0">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-xs uppercase tracking-[0.15em] font-semibold text-slate-600"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((row, idx) => (
              <tr
                key={row.id || idx}
                className={`border-b border-slate-100 transition-colors ${
                  striped && idx % 2 === 0 ? "bg-slate-50/30" : ""
                } hover:bg-slate-50 ${typeof rowClassName === "function" ? rowClassName(row) : ""}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-4 py-8 text-center text-slate-500 text-sm" colSpan={columns.length}>
                {t("common.noData")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
