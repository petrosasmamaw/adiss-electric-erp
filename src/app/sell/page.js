"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Card from "@/components/Card";
import SectionHeader from "@/components/SectionHeader";
import InputField from "@/components/InputField";
import SearchableProductSelect from "@/components/SearchableProductSelect";
import { fetchProducts, sellProduct } from "@/lib/features/erpSlice";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function SellPage() {
  const dispatch = useDispatch();
  const { products, actionLoading } = useSelector((state) => state.erp);
  const { t } = useLanguage();

  const [selectedId, setSelectedId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [itemId, setItemId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [price, setPrice] = useState("");
  const [hasReceipt, setHasReceipt] = useState(true);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const selectedProduct = useMemo(
    () => products.find((item) => String(item.id) === String(selectedId)),
    [products, selectedId]
  );

  const isTrackedProduct = Array.isArray(selectedProduct?.ids) && selectedProduct.ids.length > 0;
  const activeBatches = useMemo(
    () => (Array.isArray(selectedProduct?.batches) ? selectedProduct.batches : []),
    [selectedProduct]
  );
  const selectedBatch = useMemo(
    () => activeBatches.find((batch) => String(batch.id) === String(selectedBatchId)),
    [activeBatches, selectedBatchId]
  );

  const selectedTrackedIds = useMemo(
    () => itemId.split(",").map((value) => value.trim()).filter(Boolean),
    [itemId]
  );

  const trackedCostTotal = useMemo(() => {
    if (!isTrackedProduct || !Array.isArray(selectedProduct?.ids)) {
      return 0;
    }

    return selectedTrackedIds.reduce((sum, idValue) => {
      const matched = selectedProduct.ids.find((item) => {
        const currentId = typeof item === "object" ? String(item.id || "").trim() : String(item || "").trim();
        return currentId === idValue;
      });

      const buyPrice = typeof matched === "object"
        ? Number(matched.buy_price || selectedProduct.default_price || 0)
        : Number(selectedProduct.default_price || 0);

      return sum + buyPrice;
    }, 0);
  }, [isTrackedProduct, selectedProduct, selectedTrackedIds]);

  const sellPrice = Number(price || selectedProduct?.default_price || 0);

  useEffect(() => {
    setPrice("");
    setQuantity("1");
    setItemId("");
    setSelectedBatchId("");
    setHasReceipt(true);
  }, [selectedId]);

  useEffect(() => {
    if (!selectedProduct || isTrackedProduct) {
      return;
    }

    if (activeBatches.length > 0 && !selectedBatchId) {
      setSelectedBatchId(String(activeBatches[0].id));
    }
  }, [activeBatches, isTrackedProduct, selectedBatchId, selectedProduct]);

  async function onSubmit(event) {
    event.preventDefault();
    if (!selectedId) return;

    if (isTrackedProduct) {
    const idList = itemId
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

      const payload = idList.length
        ? { item_ids: idList, price: sellPrice, has_receipt: hasReceipt }
        : { quantity: Number(quantity), price: sellPrice, has_receipt: hasReceipt };

      await dispatch(sellProduct({ productId: selectedId, payload }));
      setQuantity("1");
      setItemId("");
      setPrice("");
      return;
    }

    if (!selectedBatchId) {
      alert(t("sell.selectBatchAlert"));
      return;
    }

    const payload = {
      batch_id: Number(selectedBatchId),
      quantity: Number(quantity),
      price: sellPrice,
      has_receipt: hasReceipt,
    };

    await dispatch(sellProduct({ productId: selectedId, payload }));
    setQuantity("1");
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
            <SearchableProductSelect
              label={t("sell.selectProduct")}
              placeholder={t("sell.selectProduct")}
              products={products}
              value={selectedId}
              onChange={setSelectedId}
              searchPlaceholder={t("sell.searchPlaceholder")}
              noResultsText={t("sell.noSearchResults")}
            />

            {/* Quantity */}
            {isTrackedProduct ? (
              <div>
                <InputField
                  label={t("sell.idsTracked")}
                  placeholder={t("sell.idsPlaceholder")}
                  value={itemId}
                  onChange={(e) => setItemId(e.target.value)}
                />
                <p className="text-xs text-slate-500 mt-2">{t("sell.idsHint")}</p>
              </div>
            ) : (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">{t("common.batch")}</label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 font-medium text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-rose-400"
                  required
                >
                  <option value="">{t("sell.selectBatch")}</option>
                  {activeBatches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {(batch.batch_name || `${t("common.batch")} ${batch.batch_no}`)}{batch.has_receipt ? "" : ` (${t("common.withoutReceipt")})`} - {batch.remaining_quantity} {t("sell.left")} @ Rs {Number(batch.buy_price || 0).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Alternative Input */}
            {!isTrackedProduct && (
              <InputField
                label={t("sell.quantityBulk")}
                type="number"
                min="1"
                placeholder={t("sell.quantityPlaceholder")}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
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

            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={hasReceipt}
                onChange={(e) => setHasReceipt(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-400"
              />
              {t("sell.saleHasReceipt")}
            </label>

            {/* Submit Button */}
            <button
              disabled={actionLoading || !selectedId || (!isTrackedProduct && !selectedBatchId)}
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {actionLoading ? `⏳ ${t("sell.processing")}` : `💰 ${t("sell.processSale")}`}
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
                    <p className="text-xs uppercase tracking-widest text-slate-600 font-semibold">{t("common.selectedProduct")}</p>
                    <h4 className="text-3xl font-bold text-slate-900 mt-2">{selectedProduct.name}</h4>
                    <p className="text-slate-600 mt-1">{selectedProduct.category}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
                      <p className="text-xs uppercase tracking-widest text-emerald-600 font-semibold">{t("common.stock")}</p>
                      <p className="text-2xl font-bold text-emerald-700 mt-1">{selectedProduct.stock}</p>
                    </div>
                    <div className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
                      <p className="text-xs uppercase tracking-widest text-amber-600 font-semibold">{t("productCard.defaultPrice")}</p>
                      <p className="text-2xl font-bold text-amber-700 mt-1">Rs {Number(selectedProduct.default_price).toFixed(0)}</p>
                    </div>
                  </div>

                  {isTrackedProduct && Array.isArray(selectedProduct.ids) && selectedProduct.ids.length > 0 && (
                    <div className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-widest text-purple-600 font-semibold">{t("sell.availableIds")}</p>
                      <p className="mt-2 text-sm text-slate-700 max-h-24 overflow-y-auto">
                        {selectedProduct.ids.map((item, index) => {
                          const idValue = typeof item === 'object' ? item.id : item;
                          const idPrice = typeof item === 'object' ? item.buy_price : null;
                          return (
                            <span key={index} className="inline-block mr-2 mb-1 px-2 py-1 bg-white rounded border border-purple-200 text-xs font-mono">
                              {idValue} {idPrice ? `(Rs ${Number(idPrice).toFixed(0)})` : ''}{item?.has_receipt === false ? ` (${t("common.withoutReceipt")})` : ""}
                            </span>
                          );
                        })}
                      </p>
                      <p className="text-xs text-purple-600 mt-2 font-semibold">{t("common.total")}: {selectedProduct.ids.length} {t("sell.itemsAvailable")}</p>
                    </div>
                  )}

                  {!isTrackedProduct && selectedBatch && (
                    <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-widest text-sky-600 font-semibold">{t("sell.selectedBatch")}</p>
                      <p className="mt-1 text-lg font-bold text-slate-900">{selectedBatch.batch_name || `${t("common.batch")} ${selectedBatch.batch_no}`}</p>
                      <p className="text-sm text-slate-600">
                        {selectedBatch.remaining_quantity} {t("sell.remainingAtBuyPrice")} Rs {Number(selectedBatch.buy_price || 0).toFixed(2)}{selectedBatch.has_receipt ? "" : ` (${t("common.withoutReceipt")})`}
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Order Summary */}
              <Card variant="elevated" className="p-6">
                <h4 className="text-lg font-bold text-slate-900 mb-4">{t("sell.salesSummary")}</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">{isTrackedProduct ? t("sell.itemIds") : t("common.quantity")}</span>
                    <span className="font-semibold text-slate-900">{isTrackedProduct ? selectedTrackedIds.length : quantity}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">{t("sell.sellPrice")}</span>
                    <span className="font-semibold text-slate-900">Rs {sellPrice.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                    <span className="font-semibold text-slate-900">{t("sell.totalRevenue")}</span>
                    <span className="text-2xl font-bold text-emerald-600">Rs {(sellPrice * (isTrackedProduct ? selectedTrackedIds.length : Number(quantity) || 1)).toFixed(2)}</span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200 space-y-2 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>{t("common.mode")}:</span>
                      <span className="font-medium text-slate-900">{isTrackedProduct ? t("common.tracked") : t("common.bulk")}</span>
                    </div>
                    {!isTrackedProduct && selectedBatch && (
                      <div className="flex justify-between text-slate-600">
                        <span>{t("common.batch")}:</span>
                        <span className="font-medium text-slate-900">{selectedBatch.batch_name || `${t("common.batch")} ${selectedBatch.batch_no}`}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Profit Indicator */}
              <Card variant="elevated" className="p-6 bg-gradient-to-br from-slate-50 to-emerald-50">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-3">{t("sell.expectedProfit")}</h4>
                <p className="text-3xl font-bold text-emerald-600">~Rs {(isTrackedProduct
                  ? (sellPrice * selectedTrackedIds.length - trackedCostTotal)
                  : ((sellPrice - (selectedBatch?.buy_price || selectedProduct.default_price || 0)) * (Number(quantity) || 1))
                ).toFixed(2)}</p>
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
