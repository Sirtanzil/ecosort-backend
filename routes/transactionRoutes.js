const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createTransaction,
  getTransactions,
  getTransactionById,
} = require("../controllers/transactionController");

// ===============================
// CREATE TRANSACTION
// POST /api/transactions
// ===============================
router.post("/", authMiddleware, createTransaction);

// ===============================
// GET ALL USER TRANSACTIONS
// GET /api/transactions
// ===============================
router.get("/", authMiddleware, getTransactions);

// ===============================
// GET TRANSACTION DETAIL
// GET /api/transactions/:id
// ===============================
router.get("/:id", authMiddleware, getTransactionById);

module.exports = router;