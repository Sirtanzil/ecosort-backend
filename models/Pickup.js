const mongoose = require("mongoose");

const pickupSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    wasteType: {
      type: String,
      required: true,
      trim: true,
    },

    weight: {
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

    note: {
      type: String,
      default: "",
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