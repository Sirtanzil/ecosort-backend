const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  getDashboard,
  getAllUsers,
  getAllPickups,
  completePickup,
  getAllWithdraws,
  approveWithdraw,
  rejectWithdraw,
} = require("../controllers/adminController");

// ======================================
// ADMIN DASHBOARD
// ======================================
router.get(
  "/dashboard",
  authMiddleware,
  adminMiddleware,
  getDashboard
);

// ======================================
// USERS
// ======================================
router.get(
  "/users",
  authMiddleware,
  adminMiddleware,
  getAllUsers
);

// ======================================
// PICKUPS
// ======================================
router.get(
  "/pickups",
  authMiddleware,
  adminMiddleware,
  getAllPickups
);

// Complete Pickup
// Body:
// {
//   "actualWeight": 4.5,
//   "pricePerKg": 3000
// }
router.put(
  "/pickups/:id/complete",
  authMiddleware,
  adminMiddleware,
  completePickup
);

// ======================================
// WITHDRAWS
// ======================================
router.get(
  "/withdraws",
  authMiddleware,
  adminMiddleware,
  getAllWithdraws
);

// Approve Withdraw
router.put(
  "/withdraws/:id/approve",
  authMiddleware,
  adminMiddleware,
  approveWithdraw
);

// Reject Withdraw
router.put(
  "/withdraws/:id/reject",
  authMiddleware,
  adminMiddleware,
  rejectWithdraw
);

module.exports = router;