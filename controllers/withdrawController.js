const User = require("../models/User");
const Withdraw = require("../models/Withdraw");
const Transaction = require("../models/Transaction");

// ===========================
// CREATE WITHDRAW
// POST /api/withdraw
// ===========================
const createWithdraw = async (req, res) => {
  try {
    const {
      amount,
      bankName,
      accountNumber,
      accountName,
    } = req.body;

    // Validasi input
    if (
      !amount ||
      !bankName ||
      !accountNumber ||
      !accountName
    ) {
      return res.status(400).json({
        success: false,
        message: "Semua field wajib diisi",
      });
    }

    // Cari user login
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    // Validasi nominal
    if (amount < 1000) {
      return res.status(400).json({
        success: false,
        message: "Minimal withdraw Rp1.000",
      });
    }

    // Cek saldo
    if (user.saldo < amount) {
      return res.status(400).json({
        success: false,
        message: "Saldo tidak mencukupi",
      });
    }

    // Kurangi saldo
    user.saldo -= amount;
    user.totalTransaction += 1;

    await user.save();

    // Simpan withdraw
    const withdraw = await Withdraw.create({
      userId: user._id,
      amount,
      bankName,
      accountNumber,
      accountName,
      status: "Pending",
      note: "",
      processedAt: null,
    });

    // Simpan transaksi
    await Transaction.create({
      userId: user._id,
      pickupId: null,
      type: "withdraw",
      amount,
      description: `Withdraw ke ${bankName}`,
      status: "Pending",
      balanceAfter: user.saldo,
    });

    res.status(201).json({
      success: true,
      message: "Permintaan withdraw berhasil dibuat",
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

// ===========================
// GET MY WITHDRAWS
// GET /api/withdraw
// ===========================
const getMyWithdraws = async (req, res) => {
  try {

    const withdraws = await Withdraw.find({
      userId: req.user.id,
    }).sort({
      createdAt: -1,
    });

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

// ===========================
// GET WITHDRAW DETAIL
// GET /api/withdraw/:id
// ===========================
const getWithdrawDetail = async (req, res) => {
  try {

    const withdraw = await Withdraw.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!withdraw) {
      return res.status(404).json({
        success: false,
        message: "Data withdraw tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
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
  createWithdraw,
  getMyWithdraws,
  getWithdrawDetail,
};