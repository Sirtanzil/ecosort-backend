const Pickup = require("../models/Pickup");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

// ======================================
// CREATE PICKUP
// ======================================
const createPickup = async (req, res) => {
  console.log("========== CREATE PICKUP ==========");
  console.log("USER :", req.user);
  console.log("BODY :", req.body);

  try {
    const {
      wasteType,
      estimatedWeight,
      address,
      pickupDate,
      pickupTime,
      note,
    } = req.body;

    const pickup = await Pickup.create({
      userId: req.user.id,
      wasteType,
      estimatedWeight,
      address,
      pickupDate,
      pickupTime,
      note,
    });

    res.status(201).json({
      success: true,
      message: "Permintaan pickup berhasil dibuat",
      data: pickup,
    });
  } catch (error) {
    console.error("========== CREATE PICKUP ERROR ==========");
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack,
    });
  }
};

// ======================================
// GET MY PICKUPS
// ======================================
const getMyPickups = async (req, res) => {
  try {
    const pickups = await Pickup.find({
      userId: req.user.id,
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
      message: error.message,
    });
  }
};

// ======================================
// GET PICKUP DETAIL
// ======================================
const getPickupDetail = async (req, res) => {
  try {
    const pickup = await Pickup.findOne({
      _id: req.params.id,
      userId: req.user.id,
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
      message: error.message,
    });
  }
};

// ======================================
// UPDATE PICKUP
// ======================================
const updatePickup = async (req, res) => {
  try {
    const pickup = await Pickup.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: "Data pickup tidak ditemukan",
      });
    }

    if (pickup.status !== "Menunggu") {
      return res.status(400).json({
        success: false,
        message: "Pickup tidak dapat diubah karena sedang diproses",
      });
    }

    const {
      wasteType,
      estimatedWeight,
      address,
      pickupDate,
      pickupTime,
      note,
    } = req.body;

    pickup.wasteType = wasteType;
    pickup.estimatedWeight = estimatedWeight;
    pickup.address = address;
    pickup.pickupDate = pickupDate;
    pickup.pickupTime = pickupTime;
    pickup.note = note;

    await pickup.save();

    res.status(200).json({
      success: true,
      message: "Pickup berhasil diperbarui",
      data: pickup,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// DELETE PICKUP
// ======================================
const deletePickup = async (req, res) => {
  try {
    const pickup = await Pickup.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: "Data pickup tidak ditemukan",
      });
    }

    if (pickup.status !== "Menunggu") {
      return res.status(400).json({
        success: false,
        message: "Pickup tidak dapat dibatalkan karena sedang diproses",
      });
    }

    await pickup.deleteOne();

    res.status(200).json({
      success: true,
      message: "Pickup berhasil dibatalkan",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
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
        message: "Pickup sudah diselesaikan",
      });
    }

    pickup.status = "Selesai";
    await pickup.save();

    const user = await User.findById(pickup.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    const pricePerKg = 5000;
    const totalAmount = pickup.estimatedWeight * pricePerKg;

    user.saldo += totalAmount;
    user.totalPickup += 1;
    user.totalTransaction += 1;
    user.totalWaste += pickup.estimatedWeight;

    await user.save();

    await Transaction.create({
      userId: user._id,
      pickupId: pickup._id,
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
      message: error.message,
    });
  }
};

module.exports = {
  createPickup,
  getMyPickups,
  getPickupDetail,
  updatePickup,
  deletePickup,
  completePickup,
};