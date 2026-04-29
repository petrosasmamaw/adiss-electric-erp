"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Card from "@/components/Card";
import DataTable from "@/components/DataTable";
import InputField from "@/components/InputField";
import SectionHeader from "@/components/SectionHeader";
import StatCard from "@/components/StatCard";
import {
  createFinanceEntry,
  fetchFinanceReports,
  fetchFinanceSummary,
  fetchSupplierCredits,
  paySupplierCredit,
} from "@/lib/features/erpSlice";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function asCurrency(value) {
  return `Rs ${Number(value || 0).toFixed(2)}`;
}

export default function BalancePage() {
  const dispatch = useDispatch();
  const { financeSummary, financeReports, supplierCredits, actionLoading } = useSelector((state) => state.erp);
  const { t } = useLanguage();

  const [range, setRange] = useState("all");
  const [accountFilter, setAccountFilter] = useState("");
  const [showSupplierCredits, setShowSupplierCredits] = useState(false);
  const [payAmounts, setPayAmounts] = useState({});
  const [form, setForm] = useState({
    account_type: "balance",
    direction: "in",
    amount: "",
    supplier_name: "",
    note: "",
  });

  useEffect(() => {
    dispatch(fetchFinanceSummary());
    dispatch(fetchSupplierCredits());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchFinanceReports({ range, account: accountFilter }));
  }, [dispatch, range, accountFilter]);

  async function onSubmit(event) {
    event.preventDefault();

    await dispatch(
      createFinanceEntry({
        account_type: form.account_type,
        direction: form.direction,
        amount: Number(form.amount),
        supplier_name: form.account_type === "credit" ? form.supplier_name.trim() : undefined,
        note: form.note,
      })
    );

    setForm((prev) => ({ ...prev, amount: "", supplier_name: "", note: "" }));
    dispatch(fetchFinanceReports({ range, account: accountFilter }));
  }

  async function onPayCredit(supplierName) {
    const amount = Number(payAmounts[supplierName] || 0);
    if (amount <= 0) return;

    await dispatch(
      paySupplierCredit({
        supplier_name: supplierName,
        amount,
        note: t("balance.payCreditNote", { supplier: supplierName }),
      })
    );

    setPayAmounts((prev) => ({ ...prev, [supplierName]: "" }));
    dispatch(fetchFinanceReports({ range, account: accountFilter }));
  }

  const reportColumns = [
    {
      key: "ethiopian_date",
      label: t("common.date"),
      render: (row) => row.ethiopian_date || "-",
    },
    {
      key: "account_type",
      label: t("balance.account"),
      render: (row) => (
        <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
          {row.account_type === "balance" ? "Balance" : "Credit"}
        </span>
      ),
    },
    {
      key: "direction",
      label: t("balance.direction"),
      render: (row) => (
        <span
          className={`rounded-lg px-2 py-1 text-xs font-semibold ${
            row.direction === "in" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
          }`}
        >
          {row.direction === "in" ? "IN" : "OUT"}
        </span>
      ),
    },
    {
      key: "amount",
      label: t("common.amount"),
      render: (row) => <span className="font-semibold">{asCurrency(row.amount)}</span>,
    },
    {
      key: "supplier_name",
      label: t("balance.supplier"),
      render: (row) => row.supplier_name || "-",
    },
    {
      key: "balance_after",
      label: t("balance.balanceAfter"),
      render: (row) => <span className="font-semibold text-slate-900">{asCurrency(row.balance_after)}</span>,
    },
  ];

  return (
    <section className="space-y-8">
      <SectionHeader subtitle={t("common.finance")} title={t("balance.title")} />

      <div className="grid auto-rows-fr gap-3 md:grid-cols-2 lg:grid-cols-5">
        <StatCard label={t("common.balance")} value={asCurrency(financeSummary.balance)} icon="Balance" color="emerald" size="compact" />
        <div className="cursor-pointer" onClick={() => setShowSupplierCredits((prev) => !prev)}>
          <StatCard label={t("common.credit")} value={asCurrency(financeSummary.credit)} icon="Credit" color="amber" size="compact" />
        </div>
        <StatCard label={t("dashboard.profit")} value={asCurrency(financeSummary.profit)} icon="Profit" color="purple" size="compact" />
        <StatCard label={t("balance.stockValue")} value={asCurrency(financeSummary.stockValue)} icon="Stock" color="blue" size="compact" />
        <StatCard
          label={t("balance.netPosition")}
          value={asCurrency(
            Number(financeSummary.balance || 0) +
              Number(financeSummary.stockValue || 0) -
              Number(financeSummary.credit || 0)
          )}
          icon="Net"
          color="cyan"
          size="compact"
        />
      </div>

      {showSupplierCredits && (
        <Card variant="elevated" className="p-8">
          <SectionHeader subtitle={t("balance.suppliers")} title={t("balance.supplierCreditList")} />

          <div className="mt-6 space-y-3">
            {supplierCredits.length === 0 ? (
              <div className="p-8 text-center text-slate-500">{t("balance.noOutstanding")}</div>
            ) : (
              supplierCredits.map((row) => (
                <div
                  key={row.id}
                  className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition hover:bg-slate-50 md:flex-row md:items-center"
                >
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{row.supplier_name}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {t("balance.outstandingCredit")}: <span className="font-semibold text-rose-600">{asCurrency(row.amount)}</span>
                    </p>
                  </div>

                  <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
                    <input
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 sm:max-w-[140px]"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="Pay amount"
                      value={payAmounts[row.supplier_name] || ""}
                      onChange={(e) =>
                        setPayAmounts((prev) => ({
                          ...prev,
                          [row.supplier_name]: e.target.value,
                        }))
                      }
                    />
                    <button
                      type="button"
                      className="rounded-xl bg-amber-500 px-6 py-2.5 font-semibold text-white transition-all hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={() => onPayCredit(row.supplier_name)}
                      disabled={actionLoading}
                    >
                      {actionLoading ? "..." : "Pay"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <Card variant="elevated" className="h-fit p-6 lg:col-span-1">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <h3 className="mb-1 text-lg font-bold text-slate-900">{t("balance.addOutEntry")}</h3>
              <p className="text-sm text-slate-600">{t("balance.addOutSubtitle")}</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Account Type</label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 font-medium text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.account_type}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    account_type: e.target.value,
                    supplier_name: e.target.value === "credit" ? prev.supplier_name : "",
                  }))
                }
              >
                <option value="balance">Balance</option>
                <option value="credit">Credit</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Direction</label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 font-medium text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.direction}
                onChange={(e) => setForm((prev) => ({ ...prev, direction: e.target.value }))}
              >
                <option value="in">In</option>
                <option value="out">Out</option>
              </select>
            </div>

            <InputField
              label={t("common.amount")}
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
              required
            />

            {form.account_type === "credit" && (
              <InputField
                label={t("balance.supplierName")}
                placeholder="Supplier name"
                value={form.supplier_name}
                onChange={(e) => setForm((prev) => ({ ...prev, supplier_name: e.target.value }))}
                required
              />
            )}

            <InputField
              label={t("balance.noteOptional")}
              placeholder="Add note (optional)"
              value={form.note}
              onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
            />

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 font-semibold text-white transition-all duration-200 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              disabled={actionLoading}
            >
              {actionLoading ? "Saving..." : "Add Entry"}
            </button>
          </form>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card variant="elevated" className="flex flex-col gap-3 p-4 sm:flex-row">
            <select
              className="rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 font-medium text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={range}
              onChange={(e) => setRange(e.target.value)}
            >
              <option value="all">{t("reports.allTime")}</option>
              <option value="today">{t("reports.today")}</option>
              <option value="7d">{t("reports.sevenDays")}</option>
              <option value="30d">{t("reports.thirtyDays")}</option>
            </select>

            <select
              className="rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 font-medium text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
            >
              <option value="">{t("common.allAccounts")}</option>
              <option value="balance">{t("common.balance")}</option>
              <option value="credit">{t("common.credit")}</option>
            </select>
          </Card>

          <Card variant="elevated" className="p-6">
            <h3 className="mb-4 text-lg font-bold text-slate-900">{t("balance.reportsTitle")}</h3>
            <DataTable columns={reportColumns} data={financeReports} />
          </Card>
        </div>
      </div>
    </section>
  );
}
