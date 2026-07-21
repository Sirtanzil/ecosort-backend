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
// DASHBOARD ADMIN
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

router.put(
  "/withdraws/:id/approve",
  authMiddleware,
  adminMiddleware,
  approveWithdraw
);

router.put(
  "/withdraws/:id/reject",
  authMiddleware,
  adminMiddleware,
  rejectWithdraw
);

module.exports = router;