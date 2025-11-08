const db = require('../config/database');

class Comic {
  static async findAll(params = {}) {
    const { page = 1, limit = 20, search = '', status = '', country_id = '' } = params;
    const offset = (page - 1) * limit;

    let query = `SELECT c.*, co.name as country_name,
                        (SELECT COALESCE(SUM(ch.views), 0) FROM chapters ch WHERE ch.comic_id = c.id) as calculated_views
                 FROM comics c 
                 LEFT JOIN countries co ON c.country_id = co.id 
                 WHERE 1=1`;
    let queryParams = [];

    if (search) {
      query += ' AND (c.title LIKE ? OR c.author LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (status) {
      query += ' AND c.status = ?';
      queryParams.push(status);
    }

    if (country_id) {
      query += ' AND c.country_id = ?';
      queryParams.push(country_id);
    }

    query += ' ORDER BY c.updated_at DESC LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);

    const [comics] = await db.promise.query(query, queryParams);
    // Thay thế views bằng calculated_views
    comics.forEach(comic => {
      if (comic.calculated_views !== undefined) {
        comic.views = comic.calculated_views;
      }
    });
    return comics;
  }

  static async count(params = {}) {
    const { search = '', status = '', country_id = '' } = params;
    let query = 'SELECT COUNT(*) as total FROM comics c WHERE 1=1';
    let params_array = [];

    if (search) {
      query += ' AND (c.title LIKE ? OR c.author LIKE ?)';
      params_array.push(`%${search}%`, `%${search}%`);
    }

    if (status) {
      query += ' AND c.status = ?';
      params_array.push(status);
    }

    if (country_id) {
      query += ' AND c.country_id = ?';
      params_array.push(country_id);
    }

    const [result] = await db.promise.query(query, params_array);
    return result[0].total;
  }

  static async findByCategory(categoryId, params = {}) {
    const { page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;

    const [comics] = await db.promise.query(
      `SELECT DISTINCT c.*, co.name as country_name,
              (SELECT COALESCE(SUM(ch.views), 0) FROM chapters ch WHERE ch.comic_id = c.id) as calculated_views
       FROM comics c
       LEFT JOIN countries co ON c.country_id = co.id
       JOIN comic_categories cc ON c.id = cc.comic_id
       WHERE cc.category_id = ?
       ORDER BY c.updated_at DESC
       LIMIT ? OFFSET ?`,
      [categoryId, limit, offset]
    );
    // Thay thế views bằng calculated_views
    comics.forEach(comic => {
      if (comic.calculated_views !== undefined) {
        comic.views = comic.calculated_views;
      }
    });
    return comics;
  }

  static async countByCategory(categoryId) {
    const [result] = await db.promise.query(
      'SELECT COUNT(DISTINCT c.id) as total FROM comics c JOIN comic_categories cc ON c.id = cc.comic_id WHERE cc.category_id = ?',
      [categoryId]
    );
    return result[0].total;
  }

  static async findById(id) {
    const [comics] = await db.promise.query(
      `SELECT c.*, co.name as country_name,
              (SELECT COALESCE(SUM(ch.views), 0) FROM chapters ch WHERE ch.comic_id = c.id) as calculated_views
       FROM comics c 
       LEFT JOIN countries co ON c.country_id = co.id
       WHERE c.id = ?`,
      [id]
    );
    const comic = comics[0] || null;
    if (comic && comic.calculated_views !== undefined) {
      // Sử dụng tổng lượt xem từ các chương
      comic.views = comic.calculated_views;
    }
    return comic;
  }

  static async findByIdWithCategories(id) {
    const comic = await this.findById(id);
    if (!comic) return null;

    // Lấy thể loại
    const [categories] = await db.promise.query(
      `SELECT cat.id, cat.name, cat.slug 
       FROM categories cat
       JOIN comic_categories cc ON cat.id = cc.category_id
       WHERE cc.comic_id = ?`,
      [id]
    );
    comic.categories = categories;

    // Đảm bảo views là tổng từ các chương
    if (comic.calculated_views !== undefined) {
      comic.views = comic.calculated_views;
    }

    return comic;
  }

  static async findPopular(limit = 6) {
    const [comics] = await db.promise.query(
      `SELECT c.*, co.name as country_name,
              (SELECT COALESCE(SUM(ch.views), 0) FROM chapters ch WHERE ch.comic_id = c.id) as calculated_views
       FROM comics c 
       LEFT JOIN countries co ON c.country_id = co.id 
       ORDER BY calculated_views DESC 
       LIMIT ?`,
      [limit]
    );
    // Thay thế views bằng calculated_views
    comics.forEach(comic => {
      if (comic.calculated_views !== undefined) {
        comic.views = comic.calculated_views;
      }
    });
    return comics;
  }

  static async findLatest(limit = 18) {
    const [comics] = await db.promise.query(
      `SELECT c.*, co.name as country_name,
              (SELECT COALESCE(SUM(ch.views), 0) FROM chapters ch WHERE ch.comic_id = c.id) as calculated_views
       FROM comics c 
       LEFT JOIN countries co ON c.country_id = co.id 
       ORDER BY c.updated_at DESC 
       LIMIT ?`,
      [limit]
    );
    // Thay thế views bằng calculated_views
    comics.forEach(comic => {
      if (comic.calculated_views !== undefined) {
        comic.views = comic.calculated_views;
      }
    });
    return comics;
  }

  static async create(data) {
    const { title, slug, author, description, cover_image, status, country_id } = data;
    const [result] = await db.promise.query(
      'INSERT INTO comics (title, slug, author, description, cover_image, status, country_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, slug, author, description, cover_image, status || 'ongoing', country_id || null]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const fields = [];
    const values = [];

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const [result] = await db.promise.query(
      `UPDATE comics SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.promise.query(
      'DELETE FROM comics WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async incrementViews(id) {
    await db.promise.query(
      'UPDATE comics SET views = views + 1 WHERE id = ?',
      [id]
    );
  }

  // Tính tổng lượt xem truyện từ tổng lượt xem các chương
  static async updateViewsFromChapters(comicId) {
    const [result] = await db.promise.query(
      `UPDATE comics c 
       SET c.views = (
         SELECT COALESCE(SUM(views), 0) 
         FROM chapters 
         WHERE comic_id = ?
       )
       WHERE c.id = ?`,
      [comicId, comicId]
    );
    return result.affectedRows > 0;
  }

  // Lấy tổng lượt xem từ các chương (không cập nhật database)
  static async getTotalViewsFromChapters(comicId) {
    const [result] = await db.promise.query(
      'SELECT COALESCE(SUM(views), 0) as total_views FROM chapters WHERE comic_id = ?',
      [comicId]
    );
    return result[0]?.total_views || 0;
  }
}

module.exports = Comic;

