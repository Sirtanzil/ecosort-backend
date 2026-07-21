const Pickup = require("../models/Pickup");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

// ===========================
// CREATE PICKUP
// ===========================
const createPickup = async (req, res) => {
  try {
    const {
      wasteType,
      weight,
      address,
      pickupDate,
      note,
    } = req.body;

    const pickup = await Pickup.create({
      user: req.user.id,
      wasteType,
      weight,
      address,
      pickupDate,
      note,
    });

    res.status(201).json({
      success: true,
      message: "Permintaan pickup berhasil dibuat",
      data: pickup,
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
// GET MY PICKUPS
// ===========================
const getMyPickups = async (req, res) => {
  try {
    const pickups = await Pickup.find({
      user: req.user.id,
    }).sort({
      createdAt: -1,
    });

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

// ===========================
// GET PICKUP DETAIL
// ===========================
const getPickupDetail = async (req, res) => {
  try {
    const pickup = await Pickup.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: "Data pickup tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      data: pickup,
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
// COMPLETE PICKUP
// ===========================
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
        message: "Pickup sudah diselesaikan",
      });
    }

    pickup.status = "Selesai";
    await pickup.save();

    const user = await User.findById(pickup.user);

    // Contoh perhitungan harga
    const pricePerKg = 5000;
    const totalAmount = pickup.weight * pricePerKg;

    user.saldo += totalAmount;
    user.totalPickup += 1;
    user.totalTransaction += 1;

    await user.save();

    await Transaction.create({
      user: user._id,
      pickup: pickup._id,
      type: "pickup",
      amount: totalAmount,
      description: `Hasil penjualan sampah ${pickup.wasteType}`,
    });

    res.status(200).json({
      success: true,
      message: "Pickup berhasil diselesaikan",
      saldoMasuk: totalAmount,
      data: pickup,
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
  createPickup,
  getMyPickups,
  getPickupDetail,
  completePickup,
};