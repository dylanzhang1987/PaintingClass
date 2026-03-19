const bcrypt = require('bcrypt');
const { generateToken } = require('../config/jwt.config');
const pool = require('../config/database.config');
const User = require('../models/user.model');

const AuthService = {
  async login(username, password) {
    const user = await User.findByUsername(username);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.is_active) {
      throw new Error('Account is inactive');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      role: user.role,
      username: user.username
    });

    // Store session in database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await pool.query(
      'INSERT INTO user_sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, token, expiresAt]
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return { token, user: userWithoutPassword };
  },

  async logout(userId, token) {
    await pool.query(
      'DELETE FROM user_sessions WHERE user_id = ? AND token = ?',
      [userId, token]
    );
  },

  async logoutAll(userId) {
    await pool.query('DELETE FROM user_sessions WHERE user_id = ?', [userId]);
  },

  async validateSession(token) {
    const [sessions] = await pool.query(
      'SELECT * FROM user_sessions WHERE token = ? AND expires_at > NOW()',
      [token]
    );
    return sessions.length > 0;
  },

  async cleanupExpiredSessions() {
    await pool.query('DELETE FROM user_sessions WHERE expires_at < NOW()');
  }
};

module.exports = AuthService;
