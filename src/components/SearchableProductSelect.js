"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function SearchableProductSelect({
  label,
  placeholder,
  products = [],
  value = "",
  onChange,
  searchPlaceholder = "Search items...",
  noResultsText = "No matching items found.",
}) {
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedProduct = useMemo(
    () => products.find((item) => String(item.id) === String(value)),
    [products, value]
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return products;

    return products.filter((product) => {
      const name = String(product.name || "").toLowerCase();
      const category = String(product.category || "").toLowerCase();
      const id = String(product.id || "").toLowerCase();

      return name.includes(query) || category.includes(query) || id.includes(query);
    });
  }, [products, search]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  function handleSelect(product) {
    onChange?.(String(product.id));
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-left text-sm font-medium text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 hover:border-slate-300"
      >
        <span className={selectedProduct ? "truncate" : "text-slate-400"}>
          {selectedProduct ? `${selectedProduct.name} (${selectedProduct.category})` : placeholder}
        </span>
        <svg className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
          <div className="border-b border-slate-100 bg-slate-50 p-2.5">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
              <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-1.5">
            {filteredProducts.length ? (
              filteredProducts.map((product) => {
                const isSelected = String(product.id) === String(value);

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleSelect(product)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all ${
                      isSelected
                        ? "bg-sky-50 text-sky-900 ring-1 ring-sky-200"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold leading-tight">{product.name}</p>
                      <p className="truncate text-[11px] uppercase tracking-[0.16em] text-slate-400">{product.category}</p>
                    </div>
                    <div className="shrink-0 text-right text-[11px] font-semibold text-slate-500">
                      <div>#{product.id}</div>
                      <div>Rs {Number(product.default_price || 0).toFixed(0)}</div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-sm text-slate-500">{noResultsText}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}