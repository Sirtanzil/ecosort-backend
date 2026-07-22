const express = require("express");

const router = express.Router();

const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

// =======================
// AUTH
// =======================
router.post("/register", register);
router.post("/login", login);

// =======================
// PROFILE
// =======================
router.get(
  "/profile",
  authMiddleware,
  getProfile
);

router.put(
  "/profile",
  authMiddleware,
  updateProfile
);

// =======================
// CHANGE PASSWORD
// =======================
router.put(
  "/change-password",
  authMiddleware,
  changePassword
);

module.exports = router;