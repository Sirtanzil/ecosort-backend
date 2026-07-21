const User = require("../models/User");
const Withdraw = require("../models/Withdraw");
const Transaction = require("../models/Transaction");

// ===========================
// CREATE WITHDRAW
// ===========================
const createWithdraw = async (req, res) => {
  try {
    const {
      amount,
      bankName,
      accountNumber,
      accountName,
    } = req.body;

    // Cari user yang sedang login
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    // Validasi nominal
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Nominal withdraw harus lebih dari 0",
      });
    }

    // Cek saldo
    if (user.saldo < amount) {
      return res.status(400).json({
        success: false,
        message: "Saldo tidak mencukupi",
      });
    }

    // Kurangi saldo user
    user.saldo -= amount;
    user.totalTransaction += 1;

    await user.save();

    // Simpan data withdraw
    const withdraw = await Withdraw.create({
      user: user._id,
      amount,
      bankName,
      accountNumber,
      accountName,
      status: "Pending",
    });

    // Simpan transaksi
    await Transaction.create({
      user: user._id,
      type: "withdraw",
      amount,
      description: `Withdraw ke ${bankName}`,
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
// ===========================
const getMyWithdraws = async (req, res) => {
  try {

    const withdraws = await Withdraw.find({
      user: req.user.id,
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
// ===========================
const getWithdrawDetail = async (req, res) => {
  try {

    const withdraw = await Withdraw.findOne({
      _id: req.params.id,
      user: req.user.id,
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