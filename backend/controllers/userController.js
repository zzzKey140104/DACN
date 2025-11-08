const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/response');

class UserController {
  async getById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);

      if (!user) {
        return errorResponse(res, 'Không tìm thấy user', 404);
      }

      return successResponse(res, user);
    } catch (error) {
      console.error('Error fetching user:', error);
      return errorResponse(res, 'Lỗi server', 500);
    }
  }
}

module.exports = new UserController();

