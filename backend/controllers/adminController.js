const Comic = require('../models/Comic');
const Chapter = require('../models/Chapter');
const Category = require('../models/Category');
const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');
const path = require('path');
const fs = require('fs');

class AdminController {
  async getAllComics(req, res) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      const params = {
        page: parseInt(page),
        limit: parseInt(limit),
        search
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

  async createComic(req, res) {
    try {
      const { title, author, description, status, country_id, category_ids } = req.body;
      
      if (!title) {
        return errorResponse(res, 'Vui lòng nhập tên truyện', 400);
      }

      // Tạo slug từ title
      const slug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Xử lý ảnh cover
      const cover_image = req.files?.cover_image 
        ? `/uploads/comics/${req.files.cover_image[0].filename}`
        : null;

      const comicId = await Comic.create({
        title,
        slug,
        author,
        description,
        cover_image,
        status: status || 'ongoing',
        country_id: country_id || null
      });

      // Thêm thể loại
      if (category_ids) {
        const ids = Array.isArray(category_ids) ? category_ids : [category_ids].filter(Boolean);
        for (const categoryId of ids) {
          await db.promise.query(
            'INSERT INTO comic_categories (comic_id, category_id) VALUES (?, ?)',
            [comicId, categoryId]
          );
        }
      }

      return successResponse(res, { id: comicId }, 'Tạo truyện thành công', 201);
    } catch (error) {
      console.error('Error creating comic:', error);
      return errorResponse(res, 'Lỗi server', 500);
    }
  }

  async updateComic(req, res) {
    try {
      const { id } = req.params;
      const { title, author, description, status, country_id, category_ids } = req.body;

      const updateData = {};
      if (title) updateData.title = title;
      if (author !== undefined) updateData.author = author;
      if (description !== undefined) updateData.description = description;
      if (status) updateData.status = status;
      if (country_id !== undefined) updateData.country_id = country_id;

      // Xử lý ảnh cover mới
      if (req.files?.cover_image) {
        // Xóa ảnh cũ nếu có
        const comic = await Comic.findById(id);
        if (comic && comic.cover_image) {
          const oldImagePath = path.join(__dirname, '..', comic.cover_image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        updateData.cover_image = `/uploads/comics/${req.files.cover_image[0].filename}`;
      }

      await Comic.update(id, updateData);

      // Cập nhật thể loại
      if (category_ids !== undefined) {
        // Xóa thể loại cũ
        await db.promise.query('DELETE FROM comic_categories WHERE comic_id = ?', [id]);
        // Thêm thể loại mới
        const ids = Array.isArray(category_ids) ? category_ids : [category_ids].filter(Boolean);
        for (const categoryId of ids) {
          await db.promise.query(
            'INSERT INTO comic_categories (comic_id, category_id) VALUES (?, ?)',
            [id, categoryId]
          );
        }
      }

      return successResponse(res, null, 'Cập nhật truyện thành công');
    } catch (error) {
      console.error('Error updating comic:', error);
      return errorResponse(res, 'Lỗi server', 500);
    }
  }

  async deleteComic(req, res) {
    try {
      const { id } = req.params;
      
      // Xóa ảnh cover
      const comic = await Comic.findById(id);
      if (comic && comic.cover_image) {
        const imagePath = path.join(__dirname, '..', comic.cover_image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      await Comic.delete(id);
      return successResponse(res, null, 'Xóa truyện thành công');
    } catch (error) {
      console.error('Error deleting comic:', error);
      return errorResponse(res, 'Lỗi server', 500);
    }
  }

  async createChapter(req, res) {
    try {
      const { comic_id, chapter_number, title } = req.body;

      if (!comic_id || !chapter_number) {
        return errorResponse(res, 'Thiếu thông tin comic_id hoặc chapter_number', 400);
      }

      // Xử lý ảnh chương - upload nhiều ảnh
      const images = [];
      if (req.files?.chapter_images && req.files.chapter_images.length > 0) {
        const uploadDir = path.join(__dirname, '../uploads/chapters', comic_id.toString());
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Sắp xếp files theo thứ tự upload (theo tên file gốc hoặc thời gian)
        const sortedFiles = req.files.chapter_images.sort((a, b) => {
          return a.originalname.localeCompare(b.originalname) || a.filename.localeCompare(b.filename);
        });

        sortedFiles.forEach((file, index) => {
          // Tạo tên file với số thứ tự để đảm bảo thứ tự
          const pageNumber = String(index + 1).padStart(3, '0'); // 001, 002, 003...
          const fileExtension = path.extname(file.originalname);
          const newFilename = `page${pageNumber}_${Date.now()}_${index}${fileExtension}`;
          const newPath = path.join(uploadDir, newFilename);
          
          // Di chuyển file từ temp sang thư mục chính
          if (fs.existsSync(file.path)) {
            fs.renameSync(file.path, newPath);
            images.push(`/uploads/chapters/${comic_id}/${newFilename}`);
          }
        });
      }

      if (images.length === 0) {
        return errorResponse(res, 'Vui lòng upload ít nhất 1 ảnh cho chương', 400);
      }

      const chapterId = await Chapter.create({
        comic_id,
        chapter_number: parseInt(chapter_number),
        title,
        images: images // Truyền array, model sẽ tự stringify
      });

      // Cập nhật total_chapters
      await db.promise.query(
        'UPDATE comics SET total_chapters = (SELECT COUNT(*) FROM chapters WHERE comic_id = ?), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [comic_id, comic_id]
      );

      return successResponse(res, { id: chapterId }, 'Tạo chương thành công', 201);
    } catch (error) {
      console.error('Error creating chapter:', error);
      return errorResponse(res, 'Lỗi server', 500);
    }
  }

  async updateChapter(req, res) {
    try {
      const { id } = req.params;
      const { title } = req.body;

      const updateData = {};
      if (title !== undefined) updateData.title = title;

      // Xử lý ảnh mới nếu có
      if (req.files?.chapter_images && req.files.chapter_images.length > 0) {
        const chapter = await Chapter.findById(id);
        const comic_id = chapter.comic_id;

        // Xóa ảnh cũ
        if (chapter.images) {
          const oldImages = typeof chapter.images === 'string' 
            ? JSON.parse(chapter.images) 
            : chapter.images;
          if (Array.isArray(oldImages)) {
            oldImages.forEach(imagePath => {
              const fullPath = path.join(__dirname, '..', imagePath);
              if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
              }
            });
          }
        }

        // Lưu ảnh mới - upload nhiều ảnh
        const images = [];
        const uploadDir = path.join(__dirname, '../uploads/chapters', comic_id.toString());
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Sắp xếp files theo thứ tự
        const sortedFiles = req.files.chapter_images.sort((a, b) => {
          return a.originalname.localeCompare(b.originalname) || a.filename.localeCompare(b.filename);
        });

        sortedFiles.forEach((file, index) => {
          const pageNumber = String(index + 1).padStart(3, '0');
          const fileExtension = path.extname(file.originalname);
          const newFilename = `page${pageNumber}_${Date.now()}_${index}${fileExtension}`;
          const newPath = path.join(uploadDir, newFilename);
          
          if (fs.existsSync(file.path)) {
            fs.renameSync(file.path, newPath);
            images.push(`/uploads/chapters/${comic_id}/${newFilename}`);
          }
        });

        if (images.length > 0) {
          updateData.images = images; // Truyền array, model sẽ tự stringify
        }
      }

      await Chapter.update(id, updateData);
      return successResponse(res, null, 'Cập nhật chương thành công');
    } catch (error) {
      console.error('Error updating chapter:', error);
      return errorResponse(res, 'Lỗi server', 500);
    }
  }

  async deleteChapter(req, res) {
    try {
      const { id } = req.params;
      
      const chapter = await Chapter.findById(id);
      if (chapter) {
        // Xóa ảnh
        if (chapter.images) {
          const images = typeof chapter.images === 'string' 
            ? JSON.parse(chapter.images) 
            : chapter.images;
          images.forEach(imagePath => {
            const fullPath = path.join(__dirname, '..', imagePath);
            if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath);
            }
          });
        }

        const comic_id = chapter.comic_id;
        await Chapter.delete(id);

        // Cập nhật total_chapters
        await db.promise.query(
          'UPDATE comics SET total_chapters = (SELECT COUNT(*) FROM chapters WHERE comic_id = ?), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [comic_id, comic_id]
        );
      }

      return successResponse(res, null, 'Xóa chương thành công');
    } catch (error) {
      console.error('Error deleting chapter:', error);
      return errorResponse(res, 'Lỗi server', 500);
    }
  }
}

module.exports = new AdminController();

