const Transaction = require("../models/Transaction");

// ===========================
// GET MY TRANSACTIONS
// ===========================
const getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user.id,
    })
      .populate("pickup")
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

// ===========================
// GET TRANSACTION DETAIL
// ===========================
const getTransactionDetail = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate("pickup");

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

module.exports = {
  getMyTransactions,
  getTransactionDetail,
};