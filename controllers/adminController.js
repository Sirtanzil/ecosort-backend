const User = require("../models/User");
const Pickup = require("../models/Pickup");
const Withdraw = require("../models/Withdraw");
const Transaction = require("../models/Transaction");

// ======================================
// ADMIN DASHBOARD
// ======================================
const getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({
      role: "user",
    });

    const totalAdmins = await User.countDocuments({
      role: "admin",
    });

    const totalPickups = await Pickup.countDocuments();

    const totalWithdraws = await Withdraw.countDocuments();

    const totalTransactions = await Transaction.countDocuments();

    const saldoResult = await User.aggregate([
      {
        $group: {
          _id: null,
          totalSaldo: {
            $sum: "$saldo",
          },
        },
      },
    ]);

    const totalSaldoUsers =
      saldoResult.length > 0 ? saldoResult[0].totalSaldo : 0;

    const recentUsers = await User.find()
      .select("-password")
      .sort({
        createdAt: -1,
      })
      .limit(5);

    const recentTransactions = await Transaction.find()
      .sort({
        createdAt: -1,
      })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        statistics: {
          totalUsers,
          totalAdmins,
          totalPickups,
          totalWithdraws,
          totalTransactions,
          totalSaldoUsers,
        },
        recentUsers,
        recentTransactions,
      },
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ======================================
// GET ALL USERS
// ======================================
const getAllUsers = async (req, res) => {
  try {

    const users = await User.find()
      .select("-password")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      total: users.length,
      data: users,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
// ======================================
// GET ALL PICKUPS
// ======================================
const getAllPickups = async (req, res) => {
  try {

    const pickups = await Pickup.find()
      .populate("user", "name email phone")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      total: pickups.length,
      data: pickups,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ======================================
// COMPLETE PICKUP
// ======================================
const completePickup = async (req, res) => {
  try {

    const pickup = await Pickup.findById(req.params.id);

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: "Pickup tidak ditemukan",
      });
    }

    if (pickup.status === "Selesai") {
      return res.status(400).json({
        success: false,
        message: "Pickup sudah selesai",
      });
    }

    const PRICE_PER_KG = 2000;

    const totalPrice = pickup.weight * PRICE_PER_KG;

    pickup.status = "Selesai";

    await pickup.save();

    const user = await User.findById(pickup.user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    user.saldo += totalPrice;
    user.totalPickup += 1;
    user.totalTransaction += 1;

    await user.save();

    await Transaction.create({
      user: user._id,
      pickup: pickup._id,
      type: "pickup",
      amount: totalPrice,
      description: `Hasil penjemputan ${pickup.weight} kg sampah`,
    });

    res.status(200).json({
      success: true,
      message: "Pickup berhasil diselesaikan",
      reward: totalPrice,
      pickup,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
// ======================================
// GET ALL WITHDRAWS
// ======================================
const getAllWithdraws = async (req, res) => {
  try {
    const withdraws = await Withdraw.find()
      .populate("user", "name email phone saldo")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      total: withdraws.length,
      data: withdraws,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ======================================
// APPROVE WITHDRAW
// ======================================
const approveWithdraw = async (req, res) => {
  try {
    const withdraw = await Withdraw.findById(req.params.id);

    if (!withdraw) {
      return res.status(404).json({
        success: false,
        message: "Withdraw tidak ditemukan",
      });
    }

    if (withdraw.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Withdraw sudah diproses",
      });
    }

    withdraw.status = "Berhasil";

    await withdraw.save();

    res.status(200).json({
      success: true,
      message: "Withdraw berhasil disetujui",
      data: withdraw,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ======================================
// REJECT WITHDRAW
// ======================================
const rejectWithdraw = async (req, res) => {
  try {
    const withdraw = await Withdraw.findById(req.params.id);

    if (!withdraw) {
      return res.status(404).json({
        success: false,
        message: "Withdraw tidak ditemukan",
      });
    }

    if (withdraw.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Withdraw sudah diproses",
      });
    }

    const user = await User.findById(withdraw.user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    // Kembalikan saldo user karena withdraw ditolak
    user.saldo += withdraw.amount;
    await user.save();

    withdraw.status = "Ditolak";
    await withdraw.save();

    res.status(200).json({
      success: true,
      message: "Withdraw berhasil ditolak",
      data: withdraw,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  getDashboard,
  getAllUsers,
  getAllPickups,
  completePickup,
  getAllWithdraws,
  approveWithdraw,
  rejectWithdraw,
};