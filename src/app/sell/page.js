"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Card from "@/components/Card";
import SectionHeader from "@/components/SectionHeader";
import InputField from "@/components/InputField";
import { fetchProducts, sellProduct } from "@/lib/features/erpSlice";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function formatTrackedId(item) {
  if (!item) return "";
  const idValue = item.id || "";
  const buyPrice = Number(item.buy_price || 0);
  return buyPrice > 0 ? `${idValue} (Cost Rs ${buyPrice.toFixed(2)})` : idValue;
}

export default function SellPage() {
  const dispatch = useDispatch();
  const { products, actionLoading } = useSelector((state) => state.erp);
  const { t } = useLanguage();

  const [selectedId, setSelectedId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [itemId, setItemId] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const selectedProduct = useMemo(
    () => products.find((item) => String(item.id) === String(selectedId)),
    [products, selectedId]
  );

  const isTracked = itemId.trim().length > 0;
  const sellPrice = Number(price || selectedProduct?.default_price || 0);

  async function onSubmit(event) {
    event.preventDefault();
    if (!selectedId) return;

    const idList = itemId
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    const payload = idList.length
      ? { item_ids: idList, price: sellPrice }
      : { quantity: Number(quantity), price: sellPrice };

    await dispatch(sellProduct({ productId: selectedId, payload }));
    setQuantity("1");
    setItemId("");
    setPrice("");
  }

  return (
    <section className="space-y-8">
      {/* Hero */}
      <div>
        <SectionHeader
          subtitle={t("sell.subtitle")}
          title={t("sell.title")}
        />
      </div>

      {/* Split Layout */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Form */}
        <Card variant="elevated" className="p-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">{t("sell.title")}</h3>

          <form onSubmit={onSubmit} className="space-y-5">
            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t("sell.selectProduct")}
              </label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all font-medium text-slate-900"
              >
                <option value="">{t("sell.selectProduct")}</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <InputField
              label={isTracked ? t("sell.idsTracked") : t("sell.quantityBulk")}
              type={isTracked ? "text" : "number"}
              min="1"
              placeholder={isTracked ? "ID1, ID2, ID3" : "1"}
              value={isTracked ? itemId : quantity}
              onChange={(e) =>
                isTracked
                  ? setItemId(e.target.value)
                  : setQuantity(e.target.value)
              }
            />

            {/* Alternative Input */}
            {isTracked ? (
              <InputField
                label={t("sell.quantityBulk")}
                type="number"
                min="1"
                placeholder="Alternative: enter quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            ) : (
              <InputField
                label={t("sell.idsTracked")}
                placeholder="Alternative: enter item IDs"
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
              />
            )}

            {/* Sell Price */}
            <InputField
              label={t("sell.sellPrice")}
              type="number"
              min="0"
              step="0.01"
              placeholder={selectedProduct?.default_price || "0"}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />

            {/* Submit Button */}
            <button
              disabled={actionLoading || !selectedId}
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {actionLoading ? "⏳ Processing..." : "💰 Process Sale"}
            </button>
          </form>
        </Card>

        {/* Preview Card */}
        <div className="space-y-4">
          {selectedProduct && (
            <>
              {/* Product Preview */}
              <Card variant="gradient" className="p-8">
                <div className="space-y-6">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-600 font-semibold">Selected Product</p>
                    <h4 className="text-3xl font-bold text-slate-900 mt-2">{selectedProduct.name}</h4>
                    <p className="text-slate-600 mt-1">{selectedProduct.category}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
                      <p className="text-xs uppercase tracking-widest text-emerald-600 font-semibold">Stock</p>
                      <p className="text-2xl font-bold text-emerald-700 mt-1">{selectedProduct.stock}</p>
                    </div>
                    <div className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
                      <p className="text-xs uppercase tracking-widest text-amber-600 font-semibold">Default Price</p>
                      <p className="text-2xl font-bold text-amber-700 mt-1">Rs {Number(selectedProduct.default_price).toFixed(0)}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Order Summary */}
              <Card variant="elevated" className="p-6">
                <h4 className="text-lg font-bold text-slate-900 mb-4">Sales Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">{isTracked ? "Item IDs" : "Quantity"}</span>
                    <span className="font-semibold text-slate-900">{isTracked ? itemId.split(",").length : quantity}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Sell Price</span>
                    <span className="font-semibold text-slate-900">Rs {sellPrice.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                    <span className="font-semibold text-slate-900">Total Revenue</span>
                    <span className="text-2xl font-bold text-emerald-600">Rs {(sellPrice * (isTracked ? itemId.split(",").length : Number(quantity) || 1)).toFixed(2)}</span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200 space-y-2 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Mode:</span>
                      <span className="font-medium text-slate-900">{isTracked ? "Tracked" : "Bulk"}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Profit Indicator */}
              <Card variant="elevated" className="p-6 bg-gradient-to-br from-slate-50 to-emerald-50">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-3">Expected Profit</h4>
                <p className="text-3xl font-bold text-emerald-600">~Rs {((sellPrice - (selectedProduct.default_price || 0)) * (isTracked ? itemId.split(",").length : Number(quantity) || 1)).toFixed(2)}</p>
              </Card>
            </>
          )}

          {!selectedProduct && (
            <Card variant="elevated" className="p-12 text-center">
              <p className="text-slate-500 text-lg">{t("sell.selectProduct")}</p>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
