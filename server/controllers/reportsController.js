const { getPool, getRangeClause } = require("./erpHelpers");
const { toEthiopian } = require("ethiopian-date");

function resolveEthiopianDate(row) {
  if (row.ethiopian_date) return row.ethiopian_date;
  if (!row.created_at) return null;
  const createdAt = new Date(row.created_at);
  const [year, month, day] = toEthiopian(createdAt.getFullYear(), createdAt.getMonth() + 1, createdAt.getDate());
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

async function getItemReports(req, res) {
  const productId = Number(req.query.productId);
  const range = String(req.query.range || "all");
  const receiptFilter = String(req.query.receiptFilter || "all");

  const values = [];
  const conditions = [];

  if (Number.isInteger(productId) && productId > 0) {
    values.push(productId);
    conditions.push(`ir.product_id = $${values.length}`);
  }

  const rangeClause = getRangeClause(range, "ir.created_at");
  if (rangeClause) {
    conditions.push(rangeClause.replace(/^AND\s+/, ""));
  }

  if (receiptFilter === "red_transactions") {
    conditions.push(`ir.receipt_mismatch = TRUE`);
  } else if (receiptFilter === "buy") {
    conditions.push(`ir.type IN ('buy', 'install_stock')`);
  } else if (receiptFilter === "sell") {
    conditions.push(`ir.type = 'sell'`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const { rows } = await getPool().query(
      `
        SELECT
          ir.id,
          ir.product_id,
          p.name AS product_name,
          ir.item_id,
          ir.batch_id,
          ir.batch_no,
          ir.batch_name,
          ir.type,
          ir.quantity,
          ir.buy_price,
          ir.sell_price,
          ir.price,
          ir.profit,
          ir.ethiopian_date,
          ir.has_receipt,
          ir.receipt_mismatch,
          ir.remaining_stock,
          ir.created_at
        FROM item_reports ir
        JOIN products p ON p.id = ir.product_id
        ${whereClause}
        ORDER BY ir.created_at DESC
        LIMIT 500
      `,
      values
    );

    res.json(rows.map((row) => ({ ...row, ethiopian_date: resolveEthiopianDate(row) })));
  } catch (_error) {
    res.status(500).json({ error: "Failed to load electrical item reports" });
  }
}

module.exports = { getItemReports };