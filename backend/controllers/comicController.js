const Comic = require('../models/Comic');
const Chapter = require('../models/Chapter');
const Category = require('../models/Category');
const { successResponse, errorResponse } = require('../utils/response');

class ComicController {
  async getAll(req, res) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      const params = {
        page: parseInt(page),
        limit: parseInt(limit),
        search
      };

      const comics = await Comic.findAll(params);
      const total = await Comic.count(params); // Sửa: truyền params thay vì chỉ search

      return successResponse(res, {
        data: comics,
        pagination: {
          page: params.page,
          limit: params.limit,
          total,
          totalPages: Math.ceil(total / params.limit)
        }
      });
    } catch (error) {
      console.error('Error fetching comics:', error);
      return errorResponse(res, 'Lỗi server', 500);
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const comic = await Comic.findByIdWithCategories(id);

      if (!comic) {
        return errorResponse(res, 'Không tìm thấy truyện', 404);
      }

      // Không tăng lượt xem ở đây nữa, sẽ tách riêng endpoint
      const chapters = await Chapter.findByComicId(id);

      return successResponse(res, {
        ...comic,
        chapters
      });
    } catch (error) {
      console.error('Error fetching comic detail:', error);
      return errorResponse(res, 'Lỗi server', 500);
    }
  }

  async incrementViews(req, res) {
    try {
      const { id } = req.params;
      await Comic.incrementViews(id);
      return successResponse(res, { message: 'Đã tăng lượt xem' });
    } catch (error) {
      console.error('Error incrementing views:', error);
      return errorResponse(res, 'Lỗi server', 500);
    }
  }

  async getByCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      
      const comics = await Comic.findByCategory(categoryId, { page: parseInt(page), limit: parseInt(limit) });
      const total = await Comic.countByCategory(categoryId);

      return successResponse(res, {
        data: comics,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching comics by category:', error);
      return errorResponse(res, 'Lỗi server', 500);
    }
  }

  async getAllWithFilters(req, res) {
    try {
      const { page = 1, limit = 30, search = '', status = '', country_id = '' } = req.query;
      const params = {
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        status,
        country_id
      };

      const comics = await Comic.findAll(params);
      const total = await Comic.count(params);

      return successResponse(res, {
        data: comics,
        pagination: {
          page: params.page,
          limit: params.limit,
          total,
          totalPages: Math.ceil(total / params.limit)
        }
      });
    } catch (error) {
      console.error('Error fetching comics:', error);
      return errorResponse(res, 'Lỗi server', 500);
    }
  }

  async getLatest(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const comics = await Comic.findLatest(limit);
      return successResponse(res, comics);
    } catch (error) {
      console.error('Error fetching latest comics:', error);
      return errorResponse(res, 'Lỗi server', 500);
    }
  }

  async getPopular(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const comics = await Comic.findPopular(limit);
      return successResponse(res, comics);
    } catch (error) {
      console.error('Error fetching popular comics:', error);
      return errorResponse(res, 'Lỗi server', 500);
    }
  }
}

module.exports = new ComicController();

