const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getTransactions,
  getTransactionById,
} = require("../controllers/transactionController");

// ===============================
// GET MY TRANSACTIONS
// ===============================
router.get(
  "/",
  authMiddleware,
  getTransactions
);

// ===============================
// GET TRANSACTION DETAIL
// ===============================
router.get(
  "/:id",
  authMiddleware,
  getTransactionById
);

module.exports = router;