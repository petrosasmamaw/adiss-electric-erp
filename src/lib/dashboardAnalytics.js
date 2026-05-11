function toNumber(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
}

function toDateLabel(row) {
  if (row?.ethiopian_date) {
    return row.ethiopian_date;
  }

  if (!row?.created_at) {
    return "Unknown";
  }

  return new Date(row.created_at).toLocaleDateString();
}

function sortDateKeysAsc(keys) {
  return [...keys].sort((a, b) => a.localeCompare(b));
}

export function buildAnalytics({ dashboard = {}, reports = [], products = [], financeSummary = {} }) {
  const byDate = new Map();

  for (const row of reports) {
    const date = toDateLabel(row);
    const current = byDate.get(date) || {
      date,
      totalSales: 0,
      totalCost: 0,
      profit: 0,
      stockIn: 0,
      stockOut: 0,
      openingStockValue: 0,
    };

    const qty = toNumber(row.quantity);
    const buyPrice = toNumber(row.buy_price);
    const sellPrice = toNumber(row.sell_price);

    if (row.type === "sell") {
      const salesAmount = sellPrice * qty;
      const costAmount = buyPrice * qty;
      current.totalSales += salesAmount;
      current.totalCost += costAmount;
      current.stockOut += qty;
    }

    if (row.type === "buy") {
      current.totalCost += buyPrice * qty;
      current.stockIn += qty;
    }

    // Opening stock is tracked separately and excluded from profit and expense.
    if (row.type === "install_stock") {
      current.openingStockValue += buyPrice * qty;
      current.stockIn += qty;
    }

    current.profit = current.totalSales - current.totalCost;
    byDate.set(date, current);
  }

  const dateKeys = sortDateKeysAsc([...byDate.keys()]);
  let trendData = dateKeys.map((k) => byDate.get(k));
  let stockMovementData = dateKeys.map((k) => {
    const row = byDate.get(k);
    return {
      date: row.date,
      stockIn: row.stockIn,
      stockOut: row.stockOut,
    };
  });

  const totalsFromTrends = trendData.reduce(
    (acc, row) => {
      acc.sales += toNumber(row.totalSales);
      acc.cost += toNumber(row.totalCost);
      acc.opening += toNumber(row.openingStockValue);
      return acc;
    },
    { sales: 0, cost: 0, opening: 0 }
  );

  const salesTotal = toNumber(dashboard.totalSales) || totalsFromTrends.sales || 0;
  const costTotal = toNumber(dashboard.totalCost ?? dashboard.totalPurchases) || totalsFromTrends.cost || 0;
  const openingStockValue = totalsFromTrends.opening;
  const profit = salesTotal - costTotal;
  const profitMargin = salesTotal > 0 ? (profit / salesTotal) * 100 : 0;

  if (trendData.length === 0) {
    trendData = [];
  }

  if (stockMovementData.length === 0) {
    stockMovementData = [];
  }

  const distributionData = [
    { name: "Total Sales", value: salesTotal },
    { name: "Total Buy (Cost)", value: costTotal },
    { name: "Opening Stock Value", value: openingStockValue },
  ];

  let inventoryData = [...products]
    .map((p) => ({
      name: p.name,
      stockValue: toNumber(p.stock) * toNumber(p.default_price),
      stock: toNumber(p.stock),
    }))
    .sort((a, b) => b.stockValue - a.stockValue)
    .slice(0, 10);

  if (inventoryData.length === 0) {
    inventoryData = [];
  }

  const balance = toNumber(financeSummary.balance) || 0;
  const credit = toNumber(financeSummary.credit) || 0;
  const stockValue = toNumber(financeSummary.stockValue) || 0;
  const net = balance + stockValue - credit;

  const financialPositionData = [
    { name: "Balance", value: balance },
    { name: "Stock Value", value: stockValue },
    { name: "Credit", value: credit },
    { name: "Net", value: net },
  ];

  const profitData = [
    {
      name: "Profit",
      profit,
      margin: Number(profitMargin.toFixed(2)),
    },
  ];

  return {
    salesTotal,
    costTotal,
    profit,
    profitMargin,
    openingStockValue,
    trendData,
    stockMovementData,
    distributionData,
    inventoryData,
    profitData,
    financialPositionData,
    net,
  };
}
