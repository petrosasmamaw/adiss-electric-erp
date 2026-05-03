"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import StatCard from "@/components/StatCard";
import Card from "@/components/Card";
import SectionHeader from "@/components/SectionHeader";
import DataTable from "@/components/DataTable";
import LineChart from "@/components/charts/LineChart";
import AreaChart from "@/components/charts/AreaChart";
import DonutChart from "@/components/charts/DonutChart";
import MapPreview from "@/components/charts/MapPreview";
import { fetchDashboard } from "@/lib/features/erpSlice";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function asCurrency(value) {
  return `Rs ${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { dashboard } = useSelector((state) => state.erp);
  const { t } = useLanguage();
  const [range, setRange] = useState("all");

  useEffect(() => {
    dispatch(fetchDashboard(range));
  }, [dispatch, range]);

  const tableColumns = [
    {
      key: "created_at",
      label: t("common.date"),
      render: (row) => new Date(row.created_at).toLocaleDateString(),
    },
    {
      key: "product_name",
      label: t("common.product"),
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
            {isInstallStock ? "📦" : row.type === "buy" ? "🛒" : "💰"}{" "}
            {isInstallStock ? t("common.installStock") : row.type === "buy" ? t("common.buy") : t("common.sell")}
          </span>
        );
      },
    },
    {
      key: "amount",
      label: t("common.amount"),
      render: (row) => (
        <span className="font-semibold text-slate-900">{asCurrency(row.amount)}</span>
      ),
    },
    {
      key: "has_receipt",
      label: t("common.receipt"),
      render: (row) => (row.has_receipt ? t("common.withReceipt") : t("common.withoutReceipt")),
    },
  ];

  return (
    <section className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl border border-white/50 bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 p-8 md:p-12 text-white shadow-xl">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        
        <div className="relative space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            {t("dashboard.title")}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl">
            {t("dashboard.subtitle")}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <SectionHeader
          subtitle={t("common.overview")}
          title={t("dashboard.statistics")}
        />
        <select
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-slate-900 font-medium"
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
          <option value="all">{t("common.allTime")}</option>
          <option value="today">{t("common.today")}</option>
          <option value="7d">{t("common.last7Days")}</option>
          <option value="30d">{t("common.last30Days")}</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("dashboard.totalSales")}
          value={asCurrency(dashboard.totalSales)}
          icon="💰"
          color="emerald"
          trend="↑ 12%"
          trendPositive={true}
        />
        <StatCard
          label={t("dashboard.totalCost")}
          value={asCurrency(dashboard.totalCost ?? dashboard.totalPurchases)}
          icon="📦"
          color="amber"
          trend="↑ 8%"
          trendPositive={true}
        />
        <StatCard
          label={t("dashboard.profit")}
          value={asCurrency(dashboard.profit)}
          icon="📈"
          color="purple"
          trend="↑ 15%"
          trendPositive={true}
        />
        <StatCard
          label={t("dashboard.currentStock")}
          value={dashboard.currentStock}
          icon="📊"
          color="cyan"
          trend="↓ 2%"
          trendPositive={false}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-3 text-sm font-semibold text-slate-600">New Request Trend</div>
          <div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <LineChart data={(dashboard.trend || [10, 20, 30, 40, 60, 80]).map(Number)} width={420} height={160} />
            </div>
          </div>
        </div>

        <div>
          <div className="mb-3 text-sm font-semibold text-slate-600">Details</div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <AreaChart data={(dashboard.detailsSeries || [5, 10, 8, 20, 18, 30]).map(Number)} width={420} height={140} />
          </div>
        </div>

        <div>
          <div className="mb-3 text-sm font-semibold text-slate-600">Map Preview</div>
          <MapPreview label={"Eastern Region"} amount={`Rs ${Number(dashboard.mapValue || 0).toLocaleString()}`} />
        </div>

        <div>
          <div className="mb-3 text-sm font-semibold text-slate-600">Borrowers by State</div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-center">
            <DonutChart values={dashboard.donutValues || [60, 20, 15, 5]} size={140} />
            <div className="ml-4">
              <div className="text-2xl font-bold">Rs {Number(dashboard.totalAmount || 0).toLocaleString()}</div>
              <div className="text-sm text-slate-500">Total Amount</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions removed per UI request */}
    </section>
  );
}
