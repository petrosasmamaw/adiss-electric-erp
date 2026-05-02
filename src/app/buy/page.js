"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Card from "@/components/Card";
import InputField from "@/components/InputField";
import SearchableProductSelect from "@/components/SearchableProductSelect";
import SectionHeader from "@/components/SectionHeader";
import { buyProduct, fetchFinanceSummary, fetchProducts } from "@/lib/features/erpSlice";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function BuyPage() {
  const dispatch = useDispatch();
  const { products, actionLoading, financeSummary } = useSelector((state) => state.erp);
  const { t } = useLanguage();

  const [selectedId, setSelectedId] = useState("");
  const [mode, setMode] = useState("bulk");
  const [batchName, setBatchName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [idsText, setIdsText] = useState("");
  const [price, setPrice] = useState("");
  const [hasReceipt, setHasReceipt] = useState(true);
  const [paymentSource, setPaymentSource] = useState("credit");
  const [supplierName, setSupplierName] = useState("");

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchFinanceSummary());
  }, [dispatch]);

  const selectedProduct = useMemo(
    () => products.find((item) => String(item.id) === String(selectedId)),
    [products, selectedId]
  );

  const productIsTracked = Array.isArray(selectedProduct?.ids) && selectedProduct.ids.length > 0;

  useEffect(() => {
    if (!selectedProduct) return;
    setMode(productIsTracked ? "id" : "bulk");
    setBatchName("");
    setIdsText("");
    setQuantity("1");
  }, [productIsTracked, selectedProduct]);

  const isTracked = mode === "id";
  const fallbackUnitPrice = Number(price || selectedProduct?.default_price || 0);

  // Calculate units and total price based on input format
  let units = 0;
  let calculatedTotal = 0;
  
  if (isTracked) {
    const parts = idsText
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    
    units = parts.length;
    for (const part of parts) {
      if (part.includes(":")) {
        const [, priceStr] = part.split(":").map((p) => p.trim());
        const idPrice = parseFloat(priceStr) || fallbackUnitPrice;
        calculatedTotal += idPrice;
      } else {
        calculatedTotal += fallbackUnitPrice;
      }
    }
  } else {
    units = Number(quantity) || 1;
    calculatedTotal = fallbackUnitPrice * units;
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (!selectedId) return;

    let ids = [];
    let purchaseAmount = 0;

    if (isTracked) {
      // Parse ID:price format: "ID1:100, ID2:150, ID3:200"
      const parts = idsText
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);

      for (const part of parts) {
        if (part.includes(":")) {
          const [id, priceStr] = part.split(":").map((p) => p.trim());
          const idPrice = parseFloat(priceStr) || fallbackUnitPrice;
          if (id) {
            ids.push({ id, buy_price: idPrice });
            purchaseAmount += idPrice;
          }
        } else {
          // Fallback to editable unit price if no price is specified in ID:price format
          ids.push({ id: part, buy_price: fallbackUnitPrice });
          purchaseAmount += fallbackUnitPrice;
        }
      }

      if (ids.length === 0) {
        alert("Please enter at least one ID");
        return;
      }
    } else {
      purchaseAmount = fallbackUnitPrice * (Number(quantity) || 1);
    }

    const payload = isTracked
      ? {
          mode: "id",
          ids,
          has_receipt: hasReceipt,
          payment_source: paymentSource,
          supplier_name: paymentSource === "credit" ? supplierName.trim() : undefined,
        }
      : {
          mode: "bulk",
          batch_name: batchName.trim(),
          quantity: Number(quantity),
          price: fallbackUnitPrice,
          has_receipt: hasReceipt,
          payment_source: paymentSource,
          supplier_name: paymentSource === "credit" ? supplierName.trim() : undefined,
        };

    if (paymentSource === "bank" && Number(financeSummary.balance || 0) < purchaseAmount) {
      alert("Your balance is low. Use credit.");
      return;
    }

    try {
      await dispatch(buyProduct({ productId: selectedId, payload })).unwrap();
      setQuantity("1");
      setIdsText("");
      setBatchName("");
      setPrice("");
      setHasReceipt(true);
      setSupplierName("");
    } catch (error) {
      alert(error?.message || "Failed to process buy");
    }
  }

  return (
    <section className="space-y-8">
      <SectionHeader subtitle={t("buy.subtitle")} title={t("buy.title")} />

      <div className="grid gap-8 lg:grid-cols-2">
        <Card variant="elevated" className="p-8">
          <h3 className="mb-6 text-2xl font-bold text-slate-900">{t("buy.title")}</h3>

          <form onSubmit={onSubmit} className="space-y-5">
            <SearchableProductSelect
              label={t("buy.selectProduct")}
              placeholder={t("buy.selectProduct")}
              products={products}
              value={selectedId}
              onChange={setSelectedId}
              searchPlaceholder="Search items to buy..."
              noResultsText="No products match your search."
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 font-medium text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={!selectedProduct}
              >
                <option value="bulk" disabled={selectedProduct ? productIsTracked : false}>Bulk</option>
                <option value="id" disabled={selectedProduct ? !productIsTracked : false}>By ID</option>
              </select>
            </div>

            {isTracked ? (
              <div>
                <InputField
                  label={t("buy.idsTracked")}
                  type="text"
                  placeholder="ID1:100, ID2:150, ID3:200"
                  value={idsText}
                  onChange={(e) => setIdsText(e.target.value)}
                  required
                />
                <p className="text-xs text-slate-500 mt-2">Format: ID:price (use default price if no price specified)</p>
              </div>
            ) : (
              <>
                <InputField
                  label="Batch Name"
                  placeholder="Batch 1"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  required
                />
                <InputField
                  label={t("buy.quantityBulk")}
                  type="number"
                  min="1"
                  placeholder="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </>
            )}

            <InputField
              label={t("buy.price")}
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
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-400"
              />
              This purchase has receipt
            </label>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">{t("buy.paymentSource")}</label>
              <select
                value={paymentSource}
                onChange={(e) => setPaymentSource(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 font-medium text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="credit">{t("buy.credit")}</option>
                <option value="bank">{t("buy.bank")}</option>
              </select>
            </div>

            {paymentSource === "credit" && (
              <InputField
                label={t("buy.supplierName")}
                placeholder="Supplier name"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
              />
            )}

            <button
              disabled={actionLoading || !selectedId}
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 px-4 py-3 font-semibold text-white transition-all duration-200 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {actionLoading ? "Processing..." : "Complete Purchase"}
            </button>
          </form>
        </Card>

        <div className="space-y-4">
          {selectedProduct ? (
            <>
              <Card variant="gradient" className="p-8">
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">Selected Product</p>
                    <h4 className="mt-2 text-3xl font-bold text-slate-900">{selectedProduct.name}</h4>
                    <p className="mt-1 text-slate-600">{selectedProduct.category}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Stock</p>
                      <p className="mt-1 text-2xl font-bold text-blue-700">{selectedProduct.stock}</p>
                    </div>
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">Default Price</p>
                      <p className="mt-1 text-2xl font-bold text-emerald-700">
                        Rs {Number(selectedProduct.default_price || 0).toFixed(0)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card variant="elevated" className="p-6">
                <h4 className="mb-4 text-lg font-bold text-slate-900">Order Summary</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">{isTracked ? "IDs" : "Quantity"}</span>
                    <span className="font-semibold text-slate-900">{units}</span>
                  </div>
                  {!isTracked && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Unit Price</span>
                      <span className="font-semibold text-slate-900">Rs {fallbackUnitPrice.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                    <span className="font-semibold text-slate-900">Total</span>
                    <span className="text-2xl font-bold text-blue-600">Rs {calculatedTotal.toFixed(2)}</span>
                  </div>

                  <div className="mt-4 space-y-2 border-t border-slate-200 pt-4 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Payment:</span>
                      <span className="capitalize font-medium text-slate-900">{paymentSource}</span>
                    </div>
                    {paymentSource === "credit" && (
                      <div className="flex justify-between text-slate-600">
                        <span>Supplier:</span>
                        <span className="font-medium text-slate-900">{supplierName || "-"}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              <Card variant="elevated" className="bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                <h4 className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-700">Account Balance</h4>
                <p className="text-3xl font-bold text-slate-900">Rs {Number(financeSummary.balance || 0).toFixed(2)}</p>
              </Card>
            </>
          ) : (
            <Card variant="elevated" className="p-12 text-center">
              <p className="text-lg text-slate-500">{t("buy.selectProduct")}</p>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
