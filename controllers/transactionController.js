const Transaction = require("../models/Transaction");

// ===============================
// CREATE TRANSACTION
// POST /api/transactions
// ===============================
const createTransaction = async (req, res) => {
  try {
    const {
      wasteType,
      weight,
      pricePerKg,
    } = req.body;

    // Validasi
    if (
      !wasteType ||
      !weight ||
      !pricePerKg
    ) {
      return res.status(400).json({
        success: false,
        message: "Data transaksi belum lengkap",
      });
    }

    const amount =
      Number(weight) * Number(pricePerKg);

    const transaction =
      await Transaction.create({
        userId: req.user.id,
        type: "pickup",
        amount: amount,
        description: `${wasteType} (${weight} Kg)`,
        status: "Pending",
        balanceAfter: 0,
      });

    return res.status(201).json({
      success: true,
      message: "Transaksi berhasil dibuat",
      data: transaction,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ===============================
// GET MY TRANSACTIONS
// GET /api/transactions
// ===============================
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      userId: req.user.id,
    })
      .populate("pickupId")
      .sort({
        createdAt: -1,
      });

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
const getTransactionById = async (req, res) => {
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

    return res.status(200).json({
      success: true,
      data: transaction,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
};