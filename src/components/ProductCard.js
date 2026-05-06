// images removed: always show icon placeholder
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useState } from "react";

const CATEGORY_COLORS = {
  DC: "bg-sky-500",
  LEVELING: "bg-amber-500",
  AC: "bg-indigo-500",
  GENERIC: "bg-slate-400",
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
    <span className={`inline-flex items-center gap-2 ${color} text-white text-xs font-semibold px-2 py-1 rounded-full uppercase`}>{category}</span>
  );
}

function IconPlaceholder({ category }) {
  const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.GENERIC;
  return (
    <div className={`${color} flex items-center justify-center w-20 h-20 rounded-md`}> 
      <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M13 2L3 14h7v8l10-12h-7V2z" fill="currentColor" />
      </svg>
    </div>
  );
}

export default function ProductCard({ product, onDelete, deleting = false }) {
  const tracked = Array.isArray(product.ids) && product.ids.length > 0;
  const batches = Array.isArray(product.batches) ? product.batches : [];
  const { t } = useLanguage();

  const stock = Number(product.stock || 0);
  const stockStatus = stock > 10 ? "good" : stock > 0 ? "warning" : "critical";
  const stockColor = stockStatus === "good" ? "bg-emerald-600 text-white" : stockStatus === "warning" ? "bg-amber-500 text-white" : "bg-rose-500 text-white";

  return (
    <article className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 max-h-[220px]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 p-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <IconPlaceholder category={product.category} />
          </div>

          <div className="min-w-0">
            <h3 className="font-semibold text-sm text-slate-900 truncate">{product.name}</h3>
            <div className="mt-1">
              <CategoryPill category={product.category} />
            </div>
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-xs font-medium text-slate-700">
                {tracked ? `🏷️ ${t("productCard.trackedByIds")}` : `📦 ${t("productCard.bulkQuantity")}`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-1 rounded-md text-rose-600 hover:bg-rose-50 disabled:opacity-60"
              onClick={() => onDelete?.(product)}
              disabled={deleting}
              aria-label={t("common.delete")}
            >
              🗑️
            </button>
          </div>

          <div className={`text-xs font-semibold px-3 py-1 rounded-full ${stockColor}`}>
            {stock} {t("productCard.stock")}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-3 pb-3">
        <div className="flex items-baseline justify-between">
          <div className="text-xs uppercase tracking-widest text-slate-500">{t("productCard.defaultPrice")}</div>
          <div className="text-2xl font-bold text-slate-900">Rs {Number(product.default_price || 0).toFixed(2)}</div>
        </div>

        <div className="mt-3">
          {tracked ? (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.ids.map((item) => (
                <div key={item.id} className="flex-none px-2 py-1 rounded-full bg-slate-100 text-xs text-slate-800 font-medium mr-2">
                  {item.id}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {batches.slice(0, 3).map((batch) => (
                <div key={batch.id} className="flex items-center justify-between text-sm">
                  <div className="min-w-0 truncate font-medium">{batch.batch_name || `${t("common.batch")} ${batch.batch_no}`}</div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-slate-500">{batch.remaining_quantity}/{batch.quantity}</div>
                    <div className="w-24 h-2 bg-slate-100 rounded overflow-hidden">
                      <div className="h-2 bg-emerald-500" style={{ width: `${Math.round((batch.remaining_quantity / Math.max(batch.quantity, 1)) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
              {batches.length > 3 && (
                <div className="text-xs text-slate-400">+{batches.length - 3} {t("common.more")}</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hover actions overlay removed (edit button removed) */}
    </article>
  );
}
