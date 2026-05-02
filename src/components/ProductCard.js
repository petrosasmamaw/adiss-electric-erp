import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useState } from "react";

const fallbackImage = "https://picsum.photos/seed/electric-erp/900/600";

function formatId(item, t) {
  if (!item) return "";

  const idValue = item.id || "";
  const buyPrice = Number(item.buy_price || 0);
  const withoutReceipt = item?.has_receipt === false ? ` (${t("common.withoutReceipt")})` : "";

  if (buyPrice > 0) {
    return `${idValue} (Rs ${buyPrice.toFixed(2)})${withoutReceipt}`;
  }

  return `${idValue}${withoutReceipt}`;
}

export default function ProductCard({ product, onDelete, deleting = false }) {
  const tracked = Array.isArray(product.ids) && product.ids.length > 0;
  const batches = Array.isArray(product.batches) ? product.batches : [];
  const { t } = useLanguage();
  const [showActions, setShowActions] = useState(false);

  const stockStatus = product.stock > 10 ? "good" : product.stock > 0 ? "warning" : "critical";
  const stockColor = {
    good: "bg-emerald-100 text-emerald-700 border-emerald-200",
    warning: "bg-amber-100 text-amber-700 border-amber-200",
    critical: "bg-rose-100 text-rose-700 border-rose-200",
  };

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200/50 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <Image
          src={product.image_url || fallbackImage}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 33vw"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-block px-3 py-1.5 rounded-lg bg-blue-500/90 text-white text-xs font-bold uppercase tracking-wide backdrop-blur-sm">
            {product.category}
          </span>
        </div>

        {/* Stock Status Badge */}
        <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-lg border ${stockColor[stockStatus]} text-xs font-bold uppercase tracking-wide backdrop-blur-sm`}>
          {product.stock} {t("productCard.stock")}
        </div>

        {/* Title Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="font-bold text-lg">{product.name}</h3>
          <p className="text-xs text-white/70">{product.category}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Price */}
        <div className="flex items-baseline justify-between">
          <span className="text-xs uppercase tracking-widest text-slate-600 font-semibold">{t("productCard.defaultPrice")}</span>
          <span className="text-2xl font-bold text-slate-900">Rs {Number(product.default_price || 0).toFixed(2)}</span>
        </div>

        {/* Mode */}
        <div className="px-3 py-2 bg-slate-50 rounded-lg">
          <p className="text-xs uppercase tracking-widest text-slate-600 font-semibold mb-1">{t("productCard.mode")}</p>
          <p className="text-sm text-slate-800 font-medium">{tracked ? `🏷️ ${t("productCard.trackedByIds")}` : `📦 ${t("productCard.bulkQuantity")}`}</p>
        </div>

        {/* IDs Preview */}
        {tracked && (
          <div className="px-3 py-2 bg-slate-50 rounded-lg">
            <p className="text-xs uppercase tracking-widest text-slate-600 font-semibold mb-2">{t("common.ids")}</p>
            <p className="max-h-12 overflow-hidden text-xs text-slate-700 line-clamp-2">
              {product.ids.map((item) => formatId(item, t)).filter(Boolean).join(", ")}
            </p>
          </div>
        )}

        {!tracked && batches.length > 0 && (
          <div className="px-3 py-2 bg-slate-50 rounded-lg space-y-2">
            <p className="text-xs uppercase tracking-widest text-slate-600 font-semibold">{t("productCard.activeBatches")}</p>
            <div className="space-y-1.5 text-xs text-slate-700">
              {batches.slice(0, 3).map((batch) => (
                <div key={batch.id} className="flex items-center justify-between gap-2">
                  <span className="font-medium">{batch.batch_name || `${t("common.batch")} ${batch.batch_no}`}{batch.has_receipt ? "" : ` (${t("common.withoutReceipt")})`}</span>
                  <span className="text-slate-500">
                    {batch.remaining_quantity}/{batch.quantity} @ Rs {Number(batch.buy_price || 0).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
            {batches.length > 3 && (
              <p className="text-[11px] text-slate-400">+ {batches.length - 3} {t("common.more")}</p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            className="flex-1 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all duration-200 transform hover:scale-105 active:scale-95"
            onClick={() => setShowActions(!showActions)}
          >
            ⚙️ {t("common.edit")}
          </button>
          <button
            type="button"
            className="flex-1 px-3 py-2.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-semibold text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={() => onDelete?.(product)}
            disabled={deleting}
          >
            {deleting ? "..." : `🗑️ ${t("common.delete")}`}
          </button>
        </div>
      </div>

      {/* Quick Actions Tooltip */}
      {showActions && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/95 to-purple-600/95 backdrop-blur-sm flex items-center justify-center rounded-2xl">
          <div className="text-white text-center space-y-3">
            <p className="text-sm font-semibold">{t("productCard.quickActions")}</p>
            <p className="text-xs text-white/80">{t("productCard.quickActionsHint")}</p>
          </div>
        </div>
      )}
    </article>
  );
}
