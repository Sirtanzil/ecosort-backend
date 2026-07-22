const User = require("../models/User");
const Withdraw = require("../models/Withdraw");

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

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    if (amount < 1000) {
      return res.status(400).json({
        success: false,
        message: "Minimal withdraw Rp1.000",
      });
    }

    if (user.saldo < amount) {
      return res.status(400).json({
        success: false,
        message: "Saldo tidak mencukupi",
      });
    }

    // Cek apakah masih ada withdraw yang pending
    const pendingWithdraw = await Withdraw.findOne({
      userId: user._id,
      status: "Pending",
    });

    if (pendingWithdraw) {
      return res.status(400).json({
        success: false,
        message: "Masih ada permintaan withdraw yang sedang diproses",
      });
    }

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

    res.status(201).json({
      success: true,
      message: "Permintaan withdraw berhasil dikirim",
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