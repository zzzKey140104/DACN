const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');
const { errorResponse } = require('../utils/response');

const verifyToken = promisify(jwt.verify);

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return errorResponse(res, 'Token không được cung cấp', 401);
    }

    // Validate JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('❌ Lỗi: JWT_SECRET không được cấu hình trong file .env');
      return errorResponse(res, 'Lỗi cấu hình server', 500);
    }

    const decoded = await verifyToken(token, process.env.JWT_SECRET);

    // Lấy thông tin user từ database để có role
    const user = await User.findById(decoded.id);
    if (!user) {
      return errorResponse(res, 'User không tồn tại', 404);
    }

    req.user = {
      id: user.id,
      email: decoded.email,
      role: user.role || 'reader'
    };
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token không hợp lệ', 403);
    }
    console.error('Error in authenticateToken:', error);
    return errorResponse(res, 'Lỗi xác thực', 500);
  }
};

module.exports = {
  authenticateToken
};

