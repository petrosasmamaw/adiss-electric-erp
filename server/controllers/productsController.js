const {
  applyFinanceEntry,
  getPool,
  logItemReport,
  logTransaction,
  parseBoolean,
  parseNumeric,
} = require("./erpHelpers");

function normalizeIncomingIds(idsRaw, buyPrice = 0, hasReceipt = true) {
  if (!Array.isArray(idsRaw)) {
    return [];
  }

  return idsRaw
    .map((value) => {
      if (value && typeof value === "object") {
        const id = String(value.id || "").trim();
        const price = parseNumeric(value.buy_price, buyPrice);
        const receipt = parseBoolean(value.has_receipt, hasReceipt);
        return { id, buy_price: price, has_receipt: receipt };
      }

      return {
        id: String(value || "").trim(),
        buy_price: buyPrice,
        has_receipt: hasReceipt,
      };
    })
    .filter((item) => Boolean(item.id));
}

function normalizeStoredIds(idsRaw, fallbackBuyPrice = 0) {
  if (!Array.isArray(idsRaw)) {
    return [];
  }

  return idsRaw
    .map((value) => {
      if (value && typeof value === "object") {
        return {
          id: String(value.id || "").trim(),
          buy_price: parseNumeric(value.buy_price, fallbackBuyPrice),
          has_receipt: parseBoolean(value.has_receipt, true),
        };
      }

      return {
        id: String(value || "").trim(),
        buy_price: fallbackBuyPrice,
        has_receipt: true,
      };
    })
    .filter((item) => Boolean(item.id));
}

function getIdValue(item) {
  return String(item?.id || "").trim();
}

function normalizeBatches(batchesRaw = []) {
  if (!Array.isArray(batchesRaw)) {
    return [];
  }

  return batchesRaw
    .map((batch) => ({
      id: Number(batch?.id || 0),
      batch_no: Number(batch?.batch_no || 0),
      batch_name: String(batch?.batch_name || "").trim(),
      quantity: Number(batch?.quantity || 0),
      remaining_quantity: Number(batch?.remaining_quantity || 0),
      buy_price: parseNumeric(batch?.buy_price, 0),
      has_receipt: parseBoolean(batch?.has_receipt, true),
      created_at: batch?.created_at || null,
      updated_at: batch?.updated_at || null,
    }))
    .filter((batch) => batch.id > 0)
    .sort((left, right) => left.batch_no - right.batch_no || left.id - right.id);
}

async function getNextBatchNo(client, productId) {
  const { rows } = await client.query(
    `
      SELECT COALESCE(MAX(batch_no), 0) + 1 AS next_batch_no
      FROM product_batches
      WHERE product_id = $1
    `,
    [productId]
  );

  return Number(rows[0]?.next_batch_no || 1);
}

async function getProducts(req, res) {
  try {
    const search = String(req.query.search || "").trim();
    const values = [];
    let where = "";

    if (search) {
      values.push(`%${search}%`);
      where = "WHERE p.name ILIKE $1 OR p.category ILIKE $1";
    }

    const { rows } = await getPool().query(
      `
        SELECT
          p.id,
          p.name,
          p.category,
          p.stock,
          p.default_price,
          p.ids,
          p.image_url,
          COALESCE(
            jsonb_agg(
              jsonb_build_object(
                'id', pb.id,
                'batch_no', pb.batch_no,
                'batch_name', pb.batch_name,
                'quantity', pb.quantity,
                'remaining_quantity', pb.remaining_quantity,
                'buy_price', pb.buy_price,
                'has_receipt', pb.has_receipt,
                'created_at', pb.created_at,
                'updated_at', pb.updated_at
              )
              ORDER BY pb.batch_no ASC, pb.created_at ASC
            ) FILTER (WHERE pb.id IS NOT NULL),
            '[]'::jsonb
          ) AS batches
        FROM products p
        LEFT JOIN product_batches pb
          ON pb.product_id = p.id
          AND pb.remaining_quantity > 0
        ${where}
        GROUP BY p.id
        ORDER BY p.id DESC
      `,
      values
    );

    res.json(rows);
  } catch (error) {
    console.error("getProducts failed", error);
    res.status(500).json({ error: "Failed to load products" });
  }
}

async function createProduct(req, res) {
  const {
    name,
    category,
    mode: modeRaw,
    default_price: defaultPriceRaw,
    stock: stockRaw,
    ids: idsRaw,
    batch_name: batchNameRaw,
    has_receipt: hasReceiptRaw,
    image_url: imageUrl,
  } = req.body || {};

  if (!name || !category) {
    return res.status(400).json({ error: "name and category are required" });
  }

  const defaultPrice = parseNumeric(defaultPriceRaw, -1);
  const hasReceipt = parseBoolean(hasReceiptRaw, true);
  const ids = normalizeIncomingIds(idsRaw, defaultPrice, hasReceipt);
  const idValues = ids.map(getIdValue);
  const uniqueValues = [...new Set(idValues)];
  const uniqueIds = uniqueValues.map((idValue) => ({ id: idValue, buy_price: defaultPrice, has_receipt: hasReceipt }));
  const requestedMode = String(modeRaw || "").trim().toLowerCase();
  const normalizedMode = requestedMode === "bulk" || requestedMode === "id" || requestedMode === "tracked"
    ? requestedMode
    : uniqueIds.length > 0
      ? "id"
      : "bulk";
  const isTrackedMode = normalizedMode === "id" || normalizedMode === "tracked";
  const batchName = String(batchNameRaw || "").trim();

  if (ids.length !== uniqueIds.length) {
    return res.status(400).json({ error: "Duplicate IDs are not allowed" });
  }

  if (defaultPrice < 0) {
    return res.status(400).json({ error: "default_price must be >= 0" });
  }

  const stock = Number.isFinite(Number(stockRaw))
    ? Number(stockRaw)
    : isTrackedMode
      ? uniqueIds.length
      : 0;

  if (!Number.isInteger(stock) || stock < 0) {
    return res.status(400).json({ error: "stock must be a positive integer" });
  }

  if (isTrackedMode && uniqueIds.length === 0) {
    return res.status(400).json({ error: "Tracked mode requires IDs" });
  }

  if (!isTrackedMode && uniqueIds.length > 0) {
    return res.status(400).json({ error: "Bulk mode cannot include IDs" });
  }

  if (isTrackedMode && stock !== uniqueIds.length) {
    return res.status(400).json({
      error: "For tracked items, stock must equal ids.length",
    });
  }

  if (!isTrackedMode && stock <= 0) {
    return res.status(400).json({ error: "Bulk mode requires stock > 0" });
  }

  if (!isTrackedMode && !batchName) {
    return res.status(400).json({ error: "batch_name is required for bulk mode" });
  }

  try {
    const client = await getPool().connect();

    try {
      await client.query("BEGIN");

      const idsForInsert = isTrackedMode ? uniqueIds : [];

      const { rows } = await client.query(
        `
          INSERT INTO products (name, category, stock, default_price, ids, image_url)
          VALUES ($1, $2, $3, $4, $5::jsonb, $6)
          RETURNING id, name, category, stock, default_price, ids, image_url
        `,
        [name.trim(), category.trim(), stock, defaultPrice, JSON.stringify(idsForInsert), imageUrl || null]
      );

      const product = rows[0];

      if (stock > 0) {
        if (isTrackedMode) {
          for (let index = 0; index < uniqueIds.length; index += 1) {
            const trackedItem = uniqueIds[index];
            const trackedId = trackedItem.id;
            const idBuyPrice = parseNumeric(trackedItem.buy_price, defaultPrice);
            
            await logItemReport(client, {
              productId: product.id,
              itemId: trackedId,
              batchId: null,
              batchNo: null,
              batchName: null,
              type: "buy",
              quantity: 1,
              buyPrice: idBuyPrice,
              sellPrice: null,
              price: idBuyPrice,
              profit: 0,
              remainingStock: index + 1,
              hasReceipt,
            });
          }
        } else {
          const batchNo = await getNextBatchNo(client, product.id);

          const { rows: batchRows } = await client.query(
            `
              INSERT INTO product_batches (
                product_id,
                batch_no,
                batch_name,
                quantity,
                remaining_quantity,
                buy_price,
                has_receipt
              )
              VALUES ($1, $2, $3, $4, $5, $6, $7)
              RETURNING id, batch_no
            `,
            [product.id, batchNo, batchName, stock, stock, defaultPrice, hasReceipt]
          );

          const insertedBatch = batchRows[0];

          await logItemReport(client, {
            productId: product.id,
            itemId: null,
            batchId: insertedBatch?.id || null,
            batchNo: insertedBatch?.batch_no || batchNo,
            batchName,
            type: "buy",
            quantity: stock,
            buyPrice: defaultPrice,
            sellPrice: null,
            price: defaultPrice,
            profit: 0,
            remainingStock: stock,
            hasReceipt,
          });
        }

        // Calculate total purchase amount
        let totalAmount = 0;
        if (isTrackedMode) {
          totalAmount = uniqueIds.reduce((sum, item) => sum + parseNumeric(item.buy_price, defaultPrice), 0);
        } else {
          totalAmount = defaultPrice * stock;
        }

        await logTransaction(client, product.id, "buy", totalAmount, { hasReceipt });
      }

      await client.query("COMMIT");
      return res.status(201).json(product);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("createProduct error:", error);
    return res.status(500).json({ error: "Failed to create product", details: error.message });
  }
}

async function deleteProduct(req, res) {
  const productId = Number(req.params.id);

  if (!Number.isInteger(productId)) {
    return res.status(400).json({ error: "Invalid product id" });
  }

  try {
    const { rowCount } = await getPool().query(
      `DELETE FROM products WHERE id = $1 RETURNING id`,
      [productId]
    );

    if (!rowCount) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.json({ ok: true });
  } catch (_error) {
    return res.status(500).json({ error: "Failed to delete electrical item" });
  }
}

async function buyProduct(req, res) {
  const productId = Number(req.params.id);
  const {
    mode: modeRaw,
    quantity: quantityRaw,
    ids: idsRaw,
    batch_name: batchNameRaw,
    price: priceRaw,
    has_receipt: hasReceiptRaw,
    payment_source: paymentSourceRaw,
    supplier_name: supplierNameRaw,
  } = req.body || {};

  if (!Number.isInteger(productId)) {
    return res.status(400).json({ error: "Invalid product id" });
  }

  const client = await getPool().connect();

  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `SELECT id, stock, default_price, ids FROM products WHERE id = $1 FOR UPDATE`,
      [productId]
    );

    if (!rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Product not found" });
    }

    const product = rows[0];
    const unitPrice = parseNumeric(priceRaw, parseNumeric(product.default_price, 0));
    const hasReceipt = parseBoolean(hasReceiptRaw, true);
    const paymentSourceInput = String(paymentSourceRaw || "credit").trim().toLowerCase();
    const paymentSource = paymentSourceInput === "balance" ? "bank" : paymentSourceInput;
    const supplierName = String(supplierNameRaw || "").trim();

    if (paymentSource !== "bank" && paymentSource !== "credit") {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "payment_source must be credit or bank" });
    }

    if (paymentSource === "credit" && !supplierName) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "supplier_name is required for credit purchase" });
    }

    const financeAccountType = paymentSource === "credit" ? "credit" : "balance";
    const financeDirection = paymentSource === "credit" ? "in" : "out";

    const currentIds = normalizeStoredIds(product.ids, parseNumeric(product.default_price, 0));
    const productIsTracked = currentIds.length > 0;
    const requestedMode = String(modeRaw || "").trim().toLowerCase();
    const normalizedMode = requestedMode === "bulk" || requestedMode === "id" || requestedMode === "tracked"
      ? requestedMode
      : productIsTracked
        ? "id"
        : "bulk";
    const isTrackedMode = normalizedMode === "id" || normalizedMode === "tracked";
    const batchName = String(batchNameRaw || "").trim();

    if (productIsTracked && !isTrackedMode) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "This product is tracked by IDs. Use ID mode." });
    }

    if (!productIsTracked && isTrackedMode) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "This product is bulk. Use bulk mode." });
    }

    const trackedBuyIds = normalizeIncomingIds(idsRaw, unitPrice, hasReceipt);
    const incomingValues = trackedBuyIds.map(getIdValue);
    const uniqueIncomingValues = [...new Set(incomingValues)];
    
    // Create unique incoming with individual buy prices from the frontend
    const uniqueIncoming = uniqueIncomingValues.map((idValue) => {
      const matchingItem = trackedBuyIds.find((item) => getIdValue(item) === idValue);
      return {
        id: idValue,
        buy_price: parseNumeric(matchingItem?.buy_price, unitPrice),
        has_receipt: parseBoolean(matchingItem?.has_receipt, hasReceipt),
      };
    });

    if (trackedBuyIds.length !== uniqueIncoming.length) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Duplicate incoming IDs are not allowed" });
    }

    const currentValuesSet = new Set(currentIds.map(getIdValue));
    const duplicateExisting = uniqueIncoming.find((item) => currentValuesSet.has(getIdValue(item)));

    if (duplicateExisting) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: `Duplicate ID: ${getIdValue(duplicateExisting)}` });
    }

    if (productIsTracked && trackedBuyIds.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Tracked products must be bought with IDs" });
    }

    if (!productIsTracked && trackedBuyIds.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Bulk products must be bought by quantity" });
    }

    async function applyBuyFinanceEntry(amount, note) {
      try {
        await applyFinanceEntry(client, {
          accountType: financeAccountType,
          direction: financeDirection,
          amount,
          supplierName: paymentSource === "credit" ? supplierName : null,
          note,
          source: paymentSource === "credit" ? "buy-credit" : "buy-bank",
          referenceType: "product",
          referenceId: productId,
          hasReceipt,
          receiptMismatch: false,
        });
      } catch (error) {
        if (
          paymentSource === "bank" &&
          /insufficient balance/i.test(String(error?.message || ""))
        ) {
          throw new Error("Your balance is low. Use credit.");
        }

        throw error;
      }
    }

    if (isTrackedMode) {
      const newIds = [...currentIds, ...uniqueIncoming];
      const purchasedCount = uniqueIncoming.length;
      const newStock = product.stock + purchasedCount;
      
      // Calculate total purchase amount from individual prices
      const purchaseAmount = uniqueIncoming.reduce((sum, item) => sum + parseNumeric(item.buy_price, 0), 0);

      await applyBuyFinanceEntry(
        purchaseAmount,
        paymentSource === "credit"
          ? `Buy tracked IDs for product #${productId} on credit from ${supplierName}`
          : `Buy tracked IDs for product #${productId} via bank`
      );

      await client.query(
        `UPDATE products SET stock = $1, ids = $2::jsonb, updated_at = NOW() WHERE id = $3`,
        [newStock, JSON.stringify(newIds), productId]
      );

      for (let index = 0; index < uniqueIncoming.length; index += 1) {
        const incomingItem = uniqueIncoming[index];
        const idValue = getIdValue(incomingItem);
        const idBuyPrice = parseNumeric(incomingItem.buy_price, unitPrice);
        
        await logItemReport(client, {
          productId,
          itemId: idValue,
          batchId: null,
          batchNo: null,
          batchName: null,
          type: "buy",
          quantity: 1,
          buyPrice: idBuyPrice,
          sellPrice: null,
          price: idBuyPrice,
          profit: 0,
          remainingStock: product.stock + index + 1,
          hasReceipt: parseBoolean(incomingItem.has_receipt, hasReceipt),
        });
      }

      await logTransaction(client, productId, "buy", purchaseAmount, { hasReceipt, receiptMismatch: false });
      await client.query("COMMIT");
      return res.json({ ok: true });
    }

    const quantity = Number(quantityRaw);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "quantity must be a positive integer" });
    }

    if (!batchName) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "batch_name is required for bulk mode" });
    }

    const newStock = product.stock + quantity;
    const purchaseAmount = unitPrice * quantity;
    const batchNo = await getNextBatchNo(client, productId);

    await applyBuyFinanceEntry(
      purchaseAmount,
      paymentSource === "credit"
        ? `Buy quantity for product #${productId} on credit from ${supplierName}`
        : `Buy quantity for product #${productId} via bank`
    );

    await client.query(
      `UPDATE products SET stock = $1, default_price = $2, updated_at = NOW() WHERE id = $3`,
      [newStock, unitPrice, productId]
    );

    const { rows: batchRows } = await client.query(
      `
        INSERT INTO product_batches (
          product_id,
          batch_no,
          batch_name,
          quantity,
          remaining_quantity,
          buy_price,
          has_receipt
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, batch_no
      `,
      [productId, batchNo, batchName, quantity, quantity, unitPrice, hasReceipt]
    );

    const insertedBatch = batchRows[0];

    await logItemReport(client, {
      productId,
      itemId: null,
      batchId: insertedBatch?.id || null,
      batchNo: insertedBatch?.batch_no || batchNo,
      batchName,
      type: "buy",
      quantity,
      buyPrice: unitPrice,
      sellPrice: null,
      price: unitPrice,
      profit: 0,
      remainingStock: newStock,
      hasReceipt,
    });

    await logTransaction(client, productId, "buy", purchaseAmount, { hasReceipt, receiptMismatch: false });
    await client.query("COMMIT");

    return res.json({ ok: true });
  } catch (error) {
    await client.query("ROLLBACK");
    const message = String(error?.message || "").trim();
    if (message) {
      return res.status(400).json({ error: message });
    }

    return res.status(500).json({ error: "Failed to process buy" });
  } finally {
    client.release();
  }
}

async function sellProduct(req, res) {
  const productId = Number(req.params.id);
  const {
    quantity: quantityRaw,
    item_id: itemIdRaw,
    item_ids: itemIdsRaw,
    price: priceRaw,
    has_receipt: hasReceiptRaw,
  } = req.body || {};

  if (!Number.isInteger(productId)) {
    return res.status(400).json({ error: "Invalid product id" });
  }

  const client = await getPool().connect();

  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `SELECT id, stock, default_price, ids FROM products WHERE id = $1 FOR UPDATE`,
      [productId]
    );

    if (!rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Product not found" });
    }

    const product = rows[0];
    const currentIds = normalizeStoredIds(product.ids, parseNumeric(product.default_price, 0));

    if (product.stock <= 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "stock = 0, cannot sell" });
    }

    const unitPrice = parseNumeric(priceRaw, parseNumeric(product.default_price, 0));
    const hasReceipt = parseBoolean(hasReceiptRaw, true);
    const currentValues = currentIds.map(getIdValue);
    const singleInput = itemIdRaw ? String(itemIdRaw).trim() : "";
    const fromSingle = singleInput
      ? singleInput
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean)
      : [];
    const fromArray = Array.isArray(itemIdsRaw)
      ? itemIdsRaw.map((value) => String(value || "").trim()).filter(Boolean)
      : [];
    const requestedIds = [...fromArray, ...fromSingle];

    if (requestedIds.length > 0) {
      const uniqueRequested = [...new Set(requestedIds)];

      if (uniqueRequested.length !== requestedIds.length) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "Duplicate IDs in sell request are not allowed" });
      }

      const missingId = uniqueRequested.find((value) => !currentValues.includes(value));

      if (missingId) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: `ID not found: ${missingId}` });
      }

      const removeSet = new Set(uniqueRequested);
      const nextIds = currentIds.filter((item) => !removeSet.has(getIdValue(item)));
      const soldCount = uniqueRequested.length;
      const newStock = product.stock - soldCount;
      const saleAmount = unitPrice * soldCount;

      if (newStock < 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "Not enough stock" });
      }

      await client.query(
        `UPDATE products SET stock = $1, ids = $2::jsonb, updated_at = NOW() WHERE id = $3`,
        [newStock, JSON.stringify(nextIds), productId]
      );

      await applyFinanceEntry(client, {
        accountType: "balance",
        direction: "in",
        amount: saleAmount,
        note: `Sell tracked IDs for product #${productId}`,
        source: "sell",
        referenceType: "product",
        referenceId: productId,
        hasReceipt,
        receiptMismatch: uniqueRequested.some((soldId) => {
          const matchedItem = currentIds.find((item) => getIdValue(item) === soldId);
          return hasReceipt && !parseBoolean(matchedItem?.has_receipt, true);
        }),
      });

      for (let index = 0; index < uniqueRequested.length; index += 1) {
        const soldId = uniqueRequested[index];
        const matchedItem = currentIds.find((item) => getIdValue(item) === soldId);
        const buyPrice = parseNumeric(matchedItem?.buy_price, parseNumeric(product.default_price, 0));
        const sourceHasReceipt = parseBoolean(matchedItem?.has_receipt, true);
        const receiptMismatch = hasReceipt && !sourceHasReceipt;
        await logItemReport(client, {
          productId,
          itemId: soldId,
          batchId: null,
          batchNo: null,
          batchName: null,
          type: "sell",
          quantity: 1,
          buyPrice,
          sellPrice: unitPrice,
          price: unitPrice,
          profit: unitPrice - buyPrice,
          remainingStock: product.stock - (index + 1),
          hasReceipt,
          receiptMismatch,
        });
      }

      await logTransaction(client, productId, "sell", saleAmount, {
        hasReceipt,
        receiptMismatch: uniqueRequested.some((soldId) => {
          const matchedItem = currentIds.find((item) => getIdValue(item) === soldId);
          return hasReceipt && !parseBoolean(matchedItem?.has_receipt, true);
        }),
      });
      await client.query("COMMIT");
      return res.json({ ok: true });
    }

    if (currentIds.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Tracked products must be sold with an Item ID" });
    }

    const quantity = Number(quantityRaw);
    const batchId = Number(req.body?.batch_id || req.body?.batchId || 0);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "quantity must be a positive integer" });
    }

    const { rows: batchRows } = await client.query(
      `
        SELECT id, batch_no, batch_name, quantity, remaining_quantity, buy_price, has_receipt
        FROM product_batches
        WHERE product_id = $1 AND remaining_quantity > 0
        ORDER BY batch_no ASC, created_at ASC
        FOR UPDATE
      `,
      [productId]
    );

    const activeBatches = normalizeBatches(batchRows);
    const selectedBatch = Number.isInteger(batchId) && batchId > 0
      ? activeBatches.find((batch) => batch.id === batchId)
      : activeBatches[0];

    if (!selectedBatch) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Please select a valid batch" });
    }

    if (quantity > selectedBatch.remaining_quantity) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Not enough stock in the selected batch" });
    }

    const newStock = product.stock - quantity;
    const saleAmount = unitPrice * quantity;
    const newRemaining = selectedBatch.remaining_quantity - quantity;
    const receiptMismatch = hasReceipt && !parseBoolean(selectedBatch.has_receipt, true);

    await client.query(
      `UPDATE products SET stock = $1, updated_at = NOW() WHERE id = $2`,
      [newStock, productId]
    );

    if (newRemaining === 0) {
      await client.query(`DELETE FROM product_batches WHERE id = $1`, [selectedBatch.id]);
    } else {
      await client.query(
        `
          UPDATE product_batches
          SET remaining_quantity = $1, updated_at = NOW()
          WHERE id = $2
        `,
        [newRemaining, selectedBatch.id]
      );
    }

    await applyFinanceEntry(client, {
      accountType: "balance",
      direction: "in",
      amount: saleAmount,
      note: `Sell quantity for product #${productId}`,
      source: "sell",
      referenceType: "product",
      referenceId: productId,
      hasReceipt,
      receiptMismatch,
    });

    await logItemReport(client, {
      productId,
      itemId: null,
      batchId: selectedBatch.id,
      batchNo: selectedBatch.batch_no,
      batchName: selectedBatch.batch_name || `Batch ${selectedBatch.batch_no}`,
      type: "sell",
      quantity,
      buyPrice: selectedBatch.buy_price,
      sellPrice: unitPrice,
      price: unitPrice,
      profit: (unitPrice - selectedBatch.buy_price) * quantity,
      remainingStock: newStock,
      hasReceipt,
      receiptMismatch,
    });

    await logTransaction(client, productId, "sell", saleAmount, { hasReceipt, receiptMismatch });
    await client.query("COMMIT");
    return res.json({ ok: true });
  } catch (_error) {
    await client.query("ROLLBACK");
    return res.status(500).json({ error: "Failed to process sell" });
  } finally {
    client.release();
  }
}

module.exports = {
  buyProduct,
  createProduct,
  deleteProduct,
  getProducts,
  sellProduct,
};