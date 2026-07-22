const User = require("../models/User");
const Pickup = require("../models/Pickup");
const Withdraw = require("../models/Withdraw");
const Transaction = require("../models/Transaction");

// ======================================
// ADMIN DASHBOARD
// ======================================
const getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalAdmins = await User.countDocuments({ role: "admin" });
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
      .sort({ createdAt: -1 })
      .limit(5);

    const recentTransactions = await Transaction.find()
      .populate("userId", "name email")
      .populate("pickupId")
      .sort({ createdAt: -1 })
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
    console.error(error);

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
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: users.length,
      data: users,
    });
  } catch (error) {
    console.error(error);

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
      .populate("userId", "name email phone saldo")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: pickups.length,
      data: pickups,
    });
  } catch (error) {
    console.error(error);

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
    const { actualWeight, pricePerKg } = req.body;

    if (!actualWeight || !pricePerKg) {
      return res.status(400).json({
        success: false,
        message: "Berat aktual dan harga per kg wajib diisi",
      });
    }

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

    const transactionExist = await Transaction.findOne({
      pickupId: pickup._id,
    });

    if (transactionExist) {
      return res.status(400).json({
        success: false,
        message: "Transaksi untuk pickup ini sudah dibuat",
      });
    }

    const totalPrice = actualWeight * pricePerKg;

    pickup.actualWeight = actualWeight;
    pickup.pricePerKg = pricePerKg;
    pickup.totalPrice = totalPrice;
    pickup.status = "Selesai";

    await pickup.save();

    const user = await User.findById(pickup.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    user.saldo += totalPrice;
    user.totalPickup += 1;
    user.totalWaste += actualWeight;
    user.totalTransaction += 1;

    await user.save();

    const transaction = await Transaction.create({
      userId: user._id,
      pickupId: pickup._id,
      type: "pickup",
      amount: totalPrice,
      description: `Hasil penjualan ${pickup.wasteType} (${actualWeight} kg)`,
      status: "Selesai",
      balanceAfter: user.saldo,
    });

    res.status(200).json({
      success: true,
      message: "Pickup berhasil diselesaikan",
      data: {
        pickup,
        transaction,
        reward: totalPrice,
        currentBalance: user.saldo,
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

// ======================================
// GET ALL WITHDRAWS
// ======================================
const getAllWithdraws = async (req, res) => {
  try {
    const withdraws = await Withdraw.find()
      .populate("userId", "name email phone saldo")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: withdraws.length,
      data: withdraws,
    });
  } catch (error) {
    console.error(error);

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

    const user = await User.findById(withdraw.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    if (user.saldo < withdraw.amount) {
      return res.status(400).json({
        success: false,
        message: "Saldo user tidak mencukupi",
      });
    }

    user.saldo -= withdraw.amount;
    user.totalTransaction += 1;

    await user.save();

    withdraw.status = "Berhasil";
    withdraw.processedAt = new Date();

    await withdraw.save();

    await Transaction.create({
      userId: user._id,
      pickupId: null,
      type: "withdraw",
      amount: withdraw.amount,
      description: `Withdraw ke ${withdraw.bankName}`,
      status: "Selesai",
      balanceAfter: user.saldo,
    });

    res.status(200).json({
      success: true,
      message: "Withdraw berhasil disetujui",
      data: withdraw,
    });
  } catch (error) {
    console.error(error);

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

    withdraw.status = "Ditolak";
    withdraw.processedAt = new Date();

    await withdraw.save();

    res.status(200).json({
      success: true,
      message: "Withdraw berhasil ditolak",
      data: withdraw,
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
  getAllUsers,
  getAllPickups,
  completePickup,
  getAllWithdraws,
  approveWithdraw,
  rejectWithdraw,
};