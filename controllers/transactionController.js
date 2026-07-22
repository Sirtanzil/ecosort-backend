const Transaction = require("../models/Transaction");
const Pickup = require("../models/Pickup");

// ===============================
// CREATE TRANSACTION
// POST /api/transactions
// ===============================
exports.createTransaction = async (req, res) => {
  try {
    const { pickupId, amount, description } = req.body;

    if (!pickupId || !amount || !description) {
      return res.status(400).json({
        success: false,
        message: "Semua field wajib diisi",
      });
    }

    const pickup = await Pickup.findById(pickupId);

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: "Data pickup tidak ditemukan",
      });
    }

    if (pickup.status !== "Selesai") {
      return res.status(400).json({
        success: false,
        message: "Pickup belum selesai",
      });
    }

    const transaction = await Transaction.create({
      userId: req.user.id,
      pickupId,
      type: "pickup",
      amount,
      description,
      status: "Selesai",
    });

    res.status(201).json({
      success: true,
      message: "Transaksi berhasil dibuat",
      data: transaction,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ===============================
// GET MY TRANSACTIONS
// GET /api/transactions
// ===============================
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      userId: req.user.id,
    })
      .populate("pickupId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: transactions.length,
      data: transactions,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ===============================
// GET TRANSACTION DETAIL
// GET /api/transactions/:id
// ===============================
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).populate("pickupId");

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaksi tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};