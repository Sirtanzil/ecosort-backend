const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Withdraw = require("../models/Withdraw");
const Pickup = require("../models/Pickup");

// ===========================
// GET DASHBOARD
// GET /api/dashboard
// ===========================
const getDashboard = async (req, res) => {
  try {
    // Ambil data user
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    // Hitung total pickup
    const totalPickup = await Pickup.countDocuments({
      userId: req.user.id,
    });

    // Hitung total withdraw
    const totalWithdraw = await Withdraw.countDocuments({
      userId: req.user.id,
    });

    // Hitung total transaksi
    const totalTransaction = await Transaction.countDocuments({
      userId: req.user.id,
    });

    // Ambil 5 transaksi terbaru
    const recentTransactions = await Transaction.find({
      userId: req.user.id,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        user: {
          name: user.name,
          email: user.email,
          saldo: user.saldo,
        },
        summary: {
          totalPickup,
          totalWithdraw,
          totalTransaction,
        },
        recentTransactions,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  getDashboard,
};