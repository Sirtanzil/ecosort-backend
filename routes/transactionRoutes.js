const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getMyTransactions,
  getTransactionDetail,
} = require("../controllers/transactionController");

// ===========================
// GET MY TRANSACTIONS
// GET /api/transactions
// ===========================
router.get("/", authMiddleware, getMyTransactions);

// ===========================
// GET TRANSACTION DETAIL
// GET /api/transactions/:id
// ===========================
router.get("/:id", authMiddleware, getTransactionDetail);

module.exports = router;