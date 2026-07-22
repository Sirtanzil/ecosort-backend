const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// =======================
// REGISTER
// =======================
const register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Nama, email, dan password wajib diisi",
      });
    }

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email sudah digunakan",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || "-",
      address: address || "-",
    });

    res.status(201).json({
      success: true,
      message: "Registrasi berhasil",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        saldo: user.saldo,
        totalPickup: user.totalPickup,
        totalTransaction: user.totalTransaction,
        totalWaste: user.totalWaste,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =======================
// LOGIN
// =======================
const login = async (req, res) => {
  try {
    console.log("========== LOGIN ==========");
    console.log("BODY :", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email dan password wajib diisi",
      });
    }

    const user = await User.findOne({
      email,
    });

    console.log(
      "USER :",
      user ? user.email : "TIDAK DITEMUKAN"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email tidak ditemukan",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    console.log("PASSWORD MATCH :", isMatch);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Password salah",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    console.log("LOGIN BERHASIL");

    res.status(200).json({
      success: true,
      message: "Login berhasil",
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        saldo: user.saldo,
        totalPickup: user.totalPickup,
        totalTransaction: user.totalTransaction,
        totalWaste: user.totalWaste,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =======================
// GET PROFILE
// =======================
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =======================
// UPDATE PROFILE
// =======================
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    user.name = name ?? user.name;
    user.phone = phone ?? user.phone;
    user.address = address ?? user.address;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profil berhasil diperbarui",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        saldo: user.saldo,
        totalPickup: user.totalPickup,
        totalTransaction: user.totalTransaction,
        totalWaste: user.totalWaste,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =======================
// CHANGE PASSWORD
// =======================
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Password lama dan password baru wajib diisi",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password baru minimal 8 karakter",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    const isMatch = await bcrypt.compare(
      oldPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Password lama salah",
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    user.password = hashedPassword;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password berhasil diubah",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
};