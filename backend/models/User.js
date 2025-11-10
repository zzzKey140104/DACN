const db = require('../config/database');

class User {
  static async findByEmail(email) {
    const [users] = await db.promise.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return users[0] || null;
  }

  static async findById(id) {
    const [users] = await db.promise.query(
      'SELECT id, username, email, avatar, role, created_at FROM users WHERE id = ?',
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
}

module.exports = User;

