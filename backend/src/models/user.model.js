const pool = require('../config/database.config');

const User = {
  async findById(id) {
    const [users] = await pool.query(
      'SELECT id, username, full_name, email, role, is_active, created_at FROM users WHERE id = ?',
      [id]
    );
    return users[0];
  },

  async findByUsername(username) {
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    return users[0];
  },

  async findByEmail(email) {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return users[0];
  },

  async create(userData) {
    const [result] = await pool.query(
      'INSERT INTO users (username, password, full_name, email, role, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [userData.username, userData.password, userData.full_name, userData.email, userData.role, userData.is_active ?? true]
    );
    return result.insertId;
  },

  async update(id, userData) {
    const [result] = await pool.query(
      'UPDATE users SET full_name = ?, email = ?, role = ?, is_active = ? WHERE id = ?',
      [userData.full_name, userData.email, userData.role, userData.is_active, id]
    );
    return result.affectedRows;
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows;
  },

  async findAll(page = 1, limit = 10, search = '') {
    const offset = (page - 1) * limit;
    let query = `
      SELECT id, username, full_name, email, role, is_active, created_at
      FROM users
      WHERE role != 'super_admin'
    `;
    let params = [];

    if (search) {
      query += ' AND (username LIKE ? OR full_name LIKE ? OR email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [users] = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE role != "super_admin"';
    if (search) {
      countQuery += ' AND (username LIKE ? OR full_name LIKE ? OR email LIKE ?)';
    }
    const [count] = await pool.query(countQuery, params.slice(0, -2));

    return { users, total: count[0].total, page, limit };
  }
};

module.exports = User;
