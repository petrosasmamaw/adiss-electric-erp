"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Card from "@/components/Card";
import SectionHeader from "@/components/SectionHeader";
import DataTable from "@/components/DataTable";
import { fetchProducts, fetchReports } from "@/lib/features/erpSlice";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function asCurrency(value) {
  return `Rs ${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function ReportsPage() {
  const dispatch = useDispatch();
  const { products, reports } = useSelector((state) => state.erp);
  const { t } = useLanguage();
  const [productId, setProductId] = useState("");
  const [range, setRange] = useState("all");
  const [receiptFilter, setReceiptFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchReports({ productId, range, receiptFilter }));
  }, [dispatch, productId, range, receiptFilter]);

  const grouped = useMemo(() => {
    const buy = reports.filter((r) => r.type === "buy" || r.type === "install_stock");
    const sell = reports.filter((r) => r.type === "sell");
    return {
      buy,
      sell,
      buyTotal: buy.reduce((sum, r) => sum + Number(r.buy_price || 0) * Number(r.quantity || 0), 0),
      sellTotal: sell.reduce((sum, r) => sum + Number(r.sell_price || 0) * Number(r.quantity || 0), 0),
    };
  }, [reports]);

  const tableColumns = [
    {
      key: "created_at",
      label: t("common.date"),
      render: (row) => row.ethiopian_date || new Date(row.created_at).toLocaleDateString(),
    },
    {
      key: "product_name",
      label: t("common.product"),
    },
    {
      key: "batch_no",
      label: t("reports.batchOrId"),
      render: (row) => {
        if (row.item_id) {
          return `${row.item_id}${row.has_receipt ? "" : ` (${t("common.withoutReceipt")})`}`;
        }

        if (row.batch_name || row.batch_no) {
          const name = row.batch_name || `${t("common.batch")} ${row.batch_no}`;
          return `${name}${row.has_receipt ? "" : ` (${t("common.withoutReceipt")})`}`;
        }

        return "—";
      },
    },
    {
      key: "type",
      label: t("common.type"),
      render: (row) => {
        const isInstallStock = row.type === "install_stock";

        return (
          <span
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${
              isInstallStock
                ? "bg-amber-100 text-amber-700"
                : row.type === "buy"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {isInstallStock ? `📦 ${t("common.installStock")}` : row.type === "buy" ? `🛒 ${t("common.buy")}` : `💰 ${t("common.sell")}`}
          </span>
        );
      },
    },
    {
      key: "has_receipt",
      label: t("common.receipt"),
      render: (row) => (row.has_receipt ? t("common.withReceipt") : t("common.withoutReceipt")),
    },
    {
      key: "quantity",
      label: t("common.quantity"),
      render: (row) => <span className="font-semibold">{row.quantity}</span>,
    },
    {
      key: "buy_price",
      label: t("reports.buyPrice"),
      render: (row) => `Rs ${Number(row.buy_price || 0).toFixed(2)}`,
    },
    {
      key: "sell_price",
      label: t("reports.sellPrice"),
      render: (row) => row.sell_price == null ? "—" : `Rs ${Number(row.sell_price || 0).toFixed(2)}`,
    },
    {
      key: "profit",
      label: t("reports.profit"),
      render: (row) => {
        const hasSellPrice = row.sell_price !== null && row.sell_price !== undefined && row.sell_price !== "";
        if (!hasSellPrice) return "--";

        const sellPrice = Number(row.sell_price);
        const buyPrice = Number(row.buy_price || 0);
        if (Number.isNaN(sellPrice) || Number.isNaN(buyPrice)) return "--";

        return `Rs ${(sellPrice - buyPrice).toFixed(2)}`;
      },
    },
  ];

  return (
    <section className="space-y-6 md:space-y-8">
      {/* Hero */}
      <div>
        <SectionHeader
          subtitle={t("reports.filters")}
          title={t("reports.title")}
        />
      </div>

      {/* Filters */}
      <Card variant="elevated" className="p-3 md:p-6 flex flex-col gap-3 md:gap-4 md:flex-row md:items-end">
        <div className="w-full flex-1">
          <label className="block text-xs md:text-sm font-medium text-slate-700 mb-2">{t("reports.filterByProduct")}</label>
          <select
            className="w-full px-3 md:px-4 py-2 md:py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all font-medium text-slate-900 text-sm"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            <option value="">{t("reports.allProducts")}</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.category})
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-auto">
          <label className="block text-xs md:text-sm font-medium text-slate-700 mb-2">{t("reports.timeRange")}</label>
          <select
            className="w-full px-3 md:px-4 py-2 md:py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all font-medium text-slate-900 text-sm"
            value={range}
            onChange={(e) => setRange(e.target.value)}
          >
            <option value="all">{t("reports.allTime")}</option>
            <option value="today">{t("reports.today")}</option>
            <option value="7d">{t("reports.sevenDays")}</option>
            <option value="30d">{t("reports.thirtyDays")}</option>
          </select>
        </div>

        <div className="w-full md:w-auto">
          <label className="block text-xs md:text-sm font-medium text-slate-700 mb-2">{t("reports.reportFilterLabel")}</label>
          <select
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all font-medium text-slate-900"
            value={receiptFilter}
            onChange={(e) => setReceiptFilter(e.target.value)}
          >
            <option value="all">{t("reports.reportFilterAll")}</option>
            <option value="buy">{t("reports.reportFilterBuy")}</option>
            <option value="sell">{t("reports.reportFilterSell")}</option>
            <option value="red_transactions">{t("reports.redTransactions")}</option>
          </select>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card variant="elevated" className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50">
          <p className="text-sm uppercase tracking-widest font-semibold text-slate-600">{t("reports.buyTransactions")}</p>
          <div className="mt-3 flex items-end justify-between gap-4">
            <div>
              <p className="text-3xl font-bold tabular-nums text-blue-700">{grouped.buy.length}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">{t("reports.records")}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold tabular-nums text-blue-700 md:text-3xl">{asCurrency(grouped.buyTotal)}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">{t("reports.totalBuyAmount")}</p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/50">
          <p className="text-sm uppercase tracking-widest font-semibold text-slate-600">{t("reports.sellTransactions")}</p>
          <div className="mt-3 flex items-end justify-between gap-4">
            <div>
              <p className="text-3xl font-bold tabular-nums text-emerald-700">{grouped.sell.length}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">{t("reports.records")}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold tabular-nums text-emerald-700 md:text-3xl">{asCurrency(grouped.sellTotal)}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">{t("reports.totalSellAmount")}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Reports Table */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">{t("reports.transactions")}</h3>
        <DataTable
          columns={tableColumns}
          data={reports}
          rowClassName={(row) =>
            row.receipt_mismatch ? "!bg-rose-100 hover:!bg-rose-100 !border !border-rose-500" : ""
          }
        />
        {reports.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">{t("reports.noReports")}</p>
          </div>
        )}
      </Card>
    </section>
  );
}
