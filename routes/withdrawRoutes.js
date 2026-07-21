const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createWithdraw,
  getMyWithdraws,
  getWithdrawDetail,
} = require("../controllers/withdrawController");

// ===========================
// CREATE WITHDRAW
// POST /api/withdraw
// ===========================
router.post("/", authMiddleware, createWithdraw);

// ===========================
// GET MY WITHDRAWS
// GET /api/withdraw
// ===========================
router.get("/", authMiddleware, getMyWithdraws);

// ===========================
// GET WITHDRAW DETAIL
// GET /api/withdraw/:id
// ===========================
router.get("/:id", authMiddleware, getWithdrawDetail);

module.exports = router;