const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createPickup,
  getMyPickups,
  getPickupDetail,
  updatePickup,
  deletePickup,
  completePickup,
} = require("../controllers/pickupController");

// ======================================
// CREATE PICKUP
// POST /api/pickups
// ======================================
router.post("/", authMiddleware, createPickup);

// ======================================
// GET MY PICKUPS
// GET /api/pickups
// ======================================
router.get("/", authMiddleware, getMyPickups);

// ======================================
// GET PICKUP DETAIL
// GET /api/pickups/:id
// ======================================
router.get("/:id", authMiddleware, getPickupDetail);

// ======================================
// UPDATE PICKUP
// PUT /api/pickups/:id
// ======================================
router.put("/:id", authMiddleware, updatePickup);

// ======================================
// DELETE PICKUP
// DELETE /api/pickups/:id
// ======================================
router.delete("/:id", authMiddleware, deletePickup);

// ======================================
// COMPLETE PICKUP
// PUT /api/pickups/:id/complete
// ======================================
router.put("/:id/complete", authMiddleware, completePickup);

module.exports = router;