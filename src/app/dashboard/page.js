"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import StatCard from "@/components/StatCard";
import SectionHeader from "@/components/SectionHeader";
import ChartCard from "@/components/ChartCard";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Boxes, CircleDollarSign, Landmark, PieChart as PieChartIcon, TrendingUp } from "lucide-react";
import { buildAnalytics } from "@/lib/dashboardAnalytics";
import { fetchDashboard, fetchFinanceSummary, fetchProducts, fetchReports } from "@/lib/features/erpSlice";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function asCurrency(value) {
  return `Rs ${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { dashboard, reports, products, financeSummary } = useSelector((state) => state.erp);
  const { t } = useLanguage();
  const [range, setRange] = useState("all");

  useEffect(() => {
    dispatch(fetchDashboard(range));
    dispatch(fetchReports({ range }));
    dispatch(fetchProducts());
    dispatch(fetchFinanceSummary());
  }, [dispatch, range]);

  const analytics = useMemo(
    () => buildAnalytics({ dashboard, reports, products, financeSummary }),
    [dashboard, reports, products, financeSummary]
  );

  const donutColors = ["#2563eb", "#10b981", "#f59e0b"];
  const translateDistributionLabel = (name) => {
    if (name === "Total Sales") return t("dashboard.labelTotalSales");
    if (name === "Total Buy (Cost)") return t("dashboard.labelTotalCost");
    if (name === "Opening Stock Value") return t("dashboard.labelOpeningStockValue");
    return name;
  };

  const translateFinancialLabel = (name) => {
    if (name === "Balance") return t("dashboard.labelBalance");
    if (name === "Stock Value") return t("dashboard.seriesStockValue");
    if (name === "Credit") return t("dashboard.labelCredit");
    if (name === "Net") return t("dashboard.labelNet");
    return name;
  };

  const financialPositionColor = (name) => {
    if (name === "Balance") return "#2563eb";
    if (name === "Stock Value") return "#10b981";
    if (name === "Credit") return "#ef4444";
    return "#7c3aed";
  };

  const localizedDistributionData = analytics.distributionData.map((row) => ({
    ...row,
    name: translateDistributionLabel(row.name),
  }));

  const localizedFinancialPositionData = analytics.financialPositionData.map((row) => ({
    ...row,
    displayName: translateFinancialLabel(row.name),
  }));

  const localizedProfitData = analytics.profitData.map((row) => ({
    ...row,
    name: t("dashboard.seriesProfit"),
  }));

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
          value={asCurrency(analytics.salesTotal)}
          icon="💰"
          color="emerald"
          trend={`${analytics.profitMargin.toFixed(2)}% margin`}
          trendPositive={true}
        />
        <StatCard
          label={t("dashboard.totalCost")}
          value={asCurrency(analytics.costTotal)}
          icon="📦"
          color="amber"
          trend="Opening stock excluded"
          trendPositive={true}
        />
        <StatCard
          label={t("dashboard.profit")}
          value={asCurrency(analytics.profit)}
          icon="📈"
          color="purple"
          trend="Sales - Cost"
          trendPositive={analytics.profit >= 0}
        />
        <StatCard
          label={t("dashboard.currentStock")}
          value={dashboard.currentStock}
          icon="📊"
          color="cyan"
          trend={`Net ${asCurrency(analytics.net)}`}
          trendPositive={analytics.net >= 0}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ChartCard
          title={t("dashboard.salesTrendTitle")}
          subtitle={t("dashboard.salesTrendSubtitle")}
          icon={TrendingUp}
        >
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={analytics.trendData} margin={{ top: 10, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => asCurrency(v)} />
              <Legend />
              <Line type="monotone" dataKey="totalSales" name={t("dashboard.seriesSales")} stroke="#2563eb" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="totalCost" name={t("dashboard.seriesCost")} stroke="#f59e0b" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="profit" name={t("dashboard.seriesProfit")} stroke="#10b981" strokeWidth={2.5} dot={false} />
            </RechartsLineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title={t("dashboard.businessDistributionTitle")}
          subtitle={t("dashboard.businessDistributionSubtitle")}
          icon={PieChartIcon}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip formatter={(v) => asCurrency(v)} />
              <Legend />
              <Pie
                data={localizedDistributionData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={2}
              >
                {analytics.distributionData.map((_, idx) => (
                  <Cell key={idx} fill={donutColors[idx % donutColors.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title={t("dashboard.inventoryValueTitle")}
          subtitle={t("dashboard.inventoryValueSubtitle")}
          icon={Boxes}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.inventoryData} layout="vertical" margin={{ top: 10, right: 16, left: 16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => asCurrency(v)} />
              <Bar dataKey="stockValue" name={t("dashboard.seriesStockValue")} fill="#2563eb" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title={t("dashboard.stockMovementTitle")}
          subtitle={t("dashboard.stockMovementSubtitle")}
          icon={Activity}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.stockMovementData} margin={{ top: 10, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="stockIn" name={t("dashboard.seriesStockIn")} fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="stockOut" name={t("dashboard.seriesStockOut")} fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title={t("dashboard.profitMarginTitle")}
          subtitle={t("dashboard.profitMarginSubtitle")}
          icon={CircleDollarSign}
          className="xl:col-span-1"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={localizedProfitData} margin={{ top: 10, right: 20, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} unit="%" />
              <Tooltip formatter={(v, key) => (key === "margin" ? `${Number(v).toFixed(2)}%` : asCurrency(v))} />
              <Legend />
              <Bar yAxisId="left" dataKey="profit" name={t("dashboard.seriesProfit")} fill="#10b981" radius={[8, 8, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="margin" name={t("dashboard.seriesMargin")} stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title={t("dashboard.financialPositionTitle")}
          subtitle={t("dashboard.financialPositionSubtitle")}
          icon={Landmark}
          className="xl:col-span-1"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={localizedFinancialPositionData} margin={{ top: 10, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="displayName" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => asCurrency(v)} />
              <Legend />
              <Bar dataKey="value" name={t("dashboard.seriesAmount")} radius={[8, 8, 0, 0]}>
                {localizedFinancialPositionData.map((row, idx) => (
                  <Cell key={idx} fill={financialPositionColor(row.name)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Recent Transactions removed per UI request */}
    </section>
  );
}
