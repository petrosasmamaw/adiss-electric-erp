const express = require("express");
const {
  createFinanceEntry,
  getFinanceReports,
  getFinanceSummary,
  getSupplierCredits,
  getCustomerCredits,
  paySupplierCredit,
  payCustomerCredit,
} = require("../controllers/financeController");

const router = express.Router();

router.get("/finance/summary", getFinanceSummary);
router.get("/finance/reports", getFinanceReports);
router.get("/finance/vendor-credits", getSupplierCredits);
router.get("/finance/supplier-credits", getSupplierCredits);
router.get("/finance/customer-credits", getCustomerCredits);
router.post("/finance/entry", createFinanceEntry);
router.post("/finance/pay-vendor-credit", paySupplierCredit);
router.post("/finance/pay-credit", paySupplierCredit);
router.post("/finance/pay-customer-credit", payCustomerCredit);
router.post("/finance/receive-customer-credit", require("../controllers/financeController").receiveCustomerPayment);

module.exports = router;
