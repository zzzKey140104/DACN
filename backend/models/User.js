const db = require('../config/database');

class User {
  static async findByEmail(email) {
    const [users] = await db.promise.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return users[0] || null;
  }

  static async findByIdWithStatus(id) {
    const [users] = await db.promise.query(
      'SELECT id, username, email, avatar, role, account_status, created_at FROM users WHERE id = ?',
      [id]
    );
    return users[0] || null;
  }

  static async findById(id) {
    const [users] = await db.promise.query(
      'SELECT id, username, email, avatar, role, account_status, created_at FROM users WHERE id = ?',
      [id]
    );
    return users[0] || null;
  }

  static async create(data) {
    const { username, email, password, avatar } = data;
    const [result] = await db.promise.query(
      'INSERT INTO users (username, email, password, avatar) VALUES (?, ?, ?, ?)',
      [username, email, password, avatar || null]
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
      `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  static async emailExists(email) {
    const [users] = await db.promise.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    return users.length > 0;
  }

  static async findAll(params = {}) {
    const { page = 1, limit = 20, search = '' } = params;
    const offset = (page - 1) * limit;

    let query = 'SELECT id, username, email, avatar, role, account_status, created_at FROM users';
    const values = [];

    if (search) {
      query += ' WHERE username LIKE ? OR email LIKE ?';
      const like = `%${search}%`;
      values.push(like, like);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    values.push(limit, offset);

    const [users] = await db.promise.query(query, values);
    return users;
  }

  static async count(params = {}) {
    const { search = '' } = params;

    let query = 'SELECT COUNT(*) AS total FROM users';
    const values = [];

    if (search) {
      query += ' WHERE username LIKE ? OR email LIKE ?';
      const like = `%${search}%`;
      values.push(like, like);
    }

    const [rows] = await db.promise.query(query, values);
    return rows[0]?.total || 0;
  }

  static async delete(id) {
    const [result] = await db.promise.query(
      'DELETE FROM users WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async findAllAdmins() {
    const [admins] = await db.promise.query(
      'SELECT id, username, email FROM users WHERE role = ?',
      ['admin']
    );
    return admins;
  }
}

module.exports = User;

