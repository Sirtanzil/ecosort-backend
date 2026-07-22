const mongoose = require("mongoose");

const pickupSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    wasteType: {
      type: String,
      required: true,
      trim: true,
    },

    estimatedWeight: {
      type: Number,
      required: true,
      min: 1,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    pickupDate: {
      type: Date,
      required: true,
    },

    pickupTime: {
      type: String,
      required: true,
      trim: true,
    },

    note: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "Menunggu",
        "Diproses",
        "Dijemput",
        "Selesai",
        "Dibatalkan",
      ],
      default: "Menunggu",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Pickup", pickupSchema);