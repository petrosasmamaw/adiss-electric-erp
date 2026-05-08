// images removed: always show icon placeholder
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useState } from "react";

const CATEGORY_COLORS = {
  DC: "bg-emerald-100 text-emerald-900 border border-emerald-200",
  LEVELING: "bg-emerald-100 text-emerald-900 border border-emerald-200",
  AC: "bg-emerald-100 text-emerald-900 border border-emerald-200",
  GENERIC: "bg-emerald-100 text-emerald-900 border border-emerald-200",
};

function formatId(item, t) {
  if (!item) return "";
  const idValue = item.id || "";
  const buyPrice = Number(item.buy_price || 0);
  const withoutReceipt = item?.has_receipt === false ? ` (${t("common.withoutReceipt")})` : "";
  if (buyPrice > 0) return `${idValue} (Rs ${buyPrice.toFixed(2)})${withoutReceipt}`;
  return `${idValue}${withoutReceipt}`;
}

function CategoryPill({ category }) {
  const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.GENERIC;
  return (
    <span className={`inline-flex items-center gap-2 ${color} text-sm font-bold px-3 py-1 rounded-full uppercase`}>{category}</span>
  );
}

// avatar removed — layout is data-first, no decorative avatar

export default function ProductCard({ product, onDelete, onEdit, deleting = false }) {
  const tracked = Array.isArray(product.ids) && product.ids.length > 0;
  const batches = Array.isArray(product.batches) ? product.batches : [];
  const { t } = useLanguage();

  const stock = Number(product.stock || 0);
  const stockStatus = stock > 10 ? "good" : stock > 0 ? "warning" : "critical";
  const stockColor = stockStatus === "good" ? "bg-emerald-600 text-white" : stockStatus === "warning" ? "bg-amber-500 text-white" : "bg-rose-500 text-white";

  return (
    <article className="bg-white border border-slate-200 rounded-[12px] p-4 shadow-sm hover:shadow-lg transition-all duration-150">
      {/* Top section: name + stock */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[18px] font-bold text-emerald-900 truncate">{product.name}</h3>
          <div className="mt-1 flex items-center gap-2 text-sm">
            <CategoryPill category={product.category} />
            <span className="text-slate-300">·</span>
            <span className="text-sm text-emerald-900 font-semibold">
              {tracked ? t("productCard.trackedByIds") : t("productCard.bulkQuantity")}
            </span>
          </div>
        </div>

        <div className="flex-shrink-0 text-right">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${stockColor}`}>
            {t("productCard.stock")} {stock}
          </div>
        </div>
      </div>

      {/* Middle section: price */}
      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs uppercase tracking-widest text-slate-500">{t("productCard.defaultPrice")}</div>
        <div className="text-lg font-bold text-slate-900 whitespace-nowrap">Rs {Number(product.default_price || 0).toFixed(2)}</div>
      </div>

      {/* Bottom section: batches or ids */}
      <div className="mt-3">
        {tracked ? (
          <div className="flex gap-2 overflow-x-auto" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            {product.ids.map((item) => (
              <div key={item.id} className="flex-none px-3 py-1 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-800 font-medium mr-2">
                {item.id}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-slate-700">{batches.length === 1 ? '1 batch' : `${batches.length} batches`}</div>
            <div className="text-sm text-slate-500">{stock}/{product.total_quantity ?? stock}</div>
            <div className="flex-1 h-2 bg-slate-100 rounded overflow-hidden">
              <div className="h-2 bg-emerald-500" style={{ width: `${Math.round((stock / Math.max(product.total_quantity || stock || 1, 1)) * 100)}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Footer: divider + actions */}
      <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-end">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit?.(product)}
            disabled={deleting}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm text-blue-600 hover:bg-blue-50 disabled:opacity-60"
          >
            <span>Edit</span>
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(product)}
            disabled={deleting}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm text-rose-600 hover:bg-rose-50 disabled:opacity-60"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M10 3h4a1 1 0 011 1v2H9V4a1 1 0 011-1z"/></svg>
            <span>Delete</span>
          </button>
        </div>
      </div>
    </article>
  );
  }
