const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/response');

class AuthController {
  async register(req, res) {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return errorResponse(res, 'Vui lòng điền đầy đủ thông tin', 400);
      }

      // Kiểm tra email đã tồn tại
      const emailExists = await User.emailExists(email);
      if (emailExists) {
        return errorResponse(res, 'Email đã được sử dụng', 400);
      }

      // Mã hóa mật khẩu
      const hashedPassword = await bcrypt.hash(password, 10);

      // Lấy avatar URL nếu có file upload
      let avatar = null;
      if (req.file) {
        avatar = `/uploads/avatars/${req.file.filename}`;
      }

      // Tạo user mới
      const userId = await User.create({
        username,
        email,
        password: hashedPassword,
        avatar
      });

      const newUser = await User.findById(userId);
      return successResponse(
        res,
        { id: userId, username, email, avatar: newUser?.avatar, role: newUser?.role || 'reader' },
        'Đăng ký thành công',
        201
      );
    } catch (error) {
      console.error('Error registering user:', error);
      return errorResponse(res, 'Lỗi server', 500);
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return errorResponse(res, 'Vui lòng điền đầy đủ thông tin', 400);
      }

      // Tìm user
      const user = await User.findByEmail(email);
      if (!user) {
        return errorResponse(res, 'Email hoặc mật khẩu không đúng', 401);
      }

      // Kiểm tra account_status
      if (user.account_status === 'locked' || user.account_status === 'banned') {
        return errorResponse(res, 'Tài khoản của bạn đã bị khóa hoặc cấm vĩnh viễn. Vui lòng liên hệ quản trị viên để được hỗ trợ.', 403);
      }

      // Kiểm tra mật khẩu
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return errorResponse(res, 'Email hoặc mật khẩu không đúng', 401);
      }

      // Validate JWT_SECRET
      if (!process.env.JWT_SECRET) {
        console.error('❌ Lỗi: JWT_SECRET không được cấu hình trong file .env');
        return errorResponse(res, 'Lỗi cấu hình server', 500);
      }

      // Tạo JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return successResponse(res, {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role || 'reader',
          avatar: user.avatar,
          account_status: user.account_status || 'active'
        }
      }, 'Đăng nhập thành công');
    } catch (error) {
      console.error('Error logging in:', error);
      return errorResponse(res, 'Lỗi server', 500);
    }
  }
}

module.exports = new AuthController();

