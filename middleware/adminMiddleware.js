const User = require("../models/User");

const adminMiddleware = async (req, res, next) => {
  try {
    // Ambil data user dari JWT
    const user = await User.findById(req.user.id);

    // Cek apakah user ada
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    // Cek role
    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Hanya admin yang dapat mengakses.",
      });
    }

    next();
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = adminMiddleware;