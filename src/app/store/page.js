"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProductCard from "@/components/ProductCard";
import Card from "@/components/Card";
import SectionHeader from "@/components/SectionHeader";
import InputField from "@/components/InputField";
import { clearError, createProduct, deleteProduct, fetchProducts } from "@/lib/features/erpSlice";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const defaultImage = "https://picsum.photos/seed/electric-store/900/600";

export default function StorePage() {
  const dispatch = useDispatch();
  const { products, loading, actionLoading, error } = useSelector((state) => state.erp);
  const { t } = useLanguage();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [form, setForm] = useState({
    name: "",
    category: "",
    mode: "bulk",
    batch_name: "",
    stock: "",
    default_price: "",
    idsText: "",
    has_receipt: true,
    image_url: defaultImage,
  });

  const isTrackedMode = form.mode === "id";

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.category))];
    return cats.filter(Boolean);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesSearch = !search.trim() || 
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !categoryFilter || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  async function onSubmit(event) {
    event.preventDefault();

    const ids = isTrackedMode
      ? form.idsText
          .split(",")
          .map((part) => part.trim())
          .filter(Boolean)
          .map((idValue) => ({ id: idValue }))
      : [];

    const payload = {
      name: form.name,
      category: form.category,
      mode: isTrackedMode ? "id" : "bulk",
      default_price: Number(form.default_price || 0),
      image_url: form.image_url || defaultImage,
      has_receipt: Boolean(form.has_receipt),
      ids,
    };

    if (isTrackedMode) {
      payload.stock = ids.length;
    } else {
      payload.stock = form.stock ? Number(form.stock) : 0;
      payload.batch_name = form.batch_name.trim();
    }

    await dispatch(
      createProduct(payload)
    );

    setForm({
      name: "",
      category: "",
      mode: "bulk",
      batch_name: "",
      stock: "",
      default_price: "",
      idsText: "",
      has_receipt: true,
      image_url: defaultImage,
    });
  }

  async function handleDelete(product) {
    const confirmed = window.confirm(t("store.deleteConfirm", { name: product.name }));
    if (!confirmed) return;
    await dispatch(deleteProduct(product.id));
  }

  return (
    <section className="space-y-8">
      {/* Hero Section */}
      <div>
        <SectionHeader
          subtitle={t("store.inventory")}
          title={t("store.productManagement")}
        />
      </div>

      {/* Form & List Layout */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Add Product Form */}
        <Card variant="elevated" className="lg:col-span-1 p-6 h-fit">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">{t("store.addProduct")}</h3>
              <p className="text-sm text-slate-600">{t("store.subtitle")}</p>
            </div>

            <InputField
              label={t("store.productName")}
              placeholder="Laptop"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />

            <InputField
              label={t("store.category")}
              placeholder="Electronics"
              value={form.category}
              onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
              required
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Mode</label>
              <select
                value={form.mode}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    mode: e.target.value,
                    idsText: e.target.value === "id" ? prev.idsText : "",
                    batch_name: e.target.value === "bulk" ? prev.batch_name : "",
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 font-medium text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="bulk">Bulk</option>
                <option value="id">By ID</option>
              </select>
            </div>

            {isTrackedMode ? (
              <InputField
                label={t("store.idsInput")}
                placeholder="ID1, ID2, ID3"
                value={form.idsText}
                onChange={(e) => setForm((prev) => ({ ...prev, idsText: e.target.value }))}
                required
              />
            ) : (
              <>
                <InputField
                  label="Batch Name"
                  placeholder="Batch 1"
                  value={form.batch_name}
                  onChange={(e) => setForm((prev) => ({ ...prev, batch_name: e.target.value }))}
                  required
                />
                <InputField
                  label={t("store.stockOptional")}
                  type="number"
                  min="1"
                  placeholder="100"
                  value={form.stock}
                  onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
                  required
                />
              </>
            )}

            <InputField
              label={t("store.defaultPrice")}
              type="number"
              min="0"
              step="0.01"
              placeholder="50000"
              value={form.default_price}
              onChange={(e) => setForm((prev) => ({ ...prev, default_price: e.target.value }))}
              required
            />

            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(form.has_receipt)}
                onChange={(e) => setForm((prev) => ({ ...prev, has_receipt: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-400"
              />
              Create with receipt
            </label>

            <InputField
              label={t("store.imageUrl")}
              placeholder="https://..."
              value={form.image_url}
              onChange={(e) => setForm((prev) => ({ ...prev, image_url: e.target.value }))}
            />

            <button
              disabled={actionLoading}
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {actionLoading ? "✓ Creating..." : "➕ Add Product"}
            </button>
          </form>
        </Card>

        {/* Products List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search & Filters */}
          <Card variant="elevated" className="p-4 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={t("store.search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              />
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all font-medium text-slate-900"
            >
              <option value="">{t("common.allCategories")}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </Card>

          {/* Error Message */}
          {error && (
            <Card variant="elevated" className="p-4 border-rose-200 bg-rose-50">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-rose-700">{error}</span>
                <button
                  type="button"
                  onClick={() => dispatch(clearError())}
                  className="px-3 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-100 transition"
                >
                  {t("common.close")}
                </button>
              </div>
            </Card>
          )}

          {/* Product Grid */}
          {loading ? (
            <Card variant="elevated" className="p-8 text-center">
              <p className="text-slate-600">{t("store.loadingProducts")}</p>
            </Card>
          ) : filteredProducts.length === 0 ? (
            <Card variant="elevated" className="p-8 text-center">
              <p className="text-slate-600">{t("store.noProducts")}</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onDelete={handleDelete}
                  deleting={actionLoading}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
