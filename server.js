const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const pickupRoutes = require("./routes/pickupRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const withdrawRoutes = require("./routes/withdrawRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// ==============================
// Connect Database
// ==============================
connectDB();

// ==============================
// Middleware
// ==============================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==============================
// Root Endpoint
// ==============================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EcoSort Backend Running 🚀",
  });
});

// ==============================
// API Routes
// ==============================
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/pickups", pickupRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/withdraw", withdrawRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);

// ==============================
// 404 Handler
// ==============================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
});

// ==============================
// Global Error Handler
// ==============================
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

// ==============================
// Start Server
// ==============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server berjalan di port ${PORT}`);
});