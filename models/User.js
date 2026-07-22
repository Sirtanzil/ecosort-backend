const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    phone: {
      type: String,
      default: "-",
    },

    address: {
      type: String,
      default: "-",
    },

    saldo: {
  type: Number,
  default: 0,
},

totalPickup: {
  type: Number,
  default: 0,
},

totalWaste: {
  type: Number,
  default: 0,
},

totalTransaction: {
  type: Number,
  default: 0,
},
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);