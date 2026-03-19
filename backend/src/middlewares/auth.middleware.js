const { verifyToken } = require('../config/jwt.config');
const pool = require('../config/database.config');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(token);

    // Get user from database
    const [users] = await pool.query(
      'SELECT id, username, full_name, email, role, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!users.length || !users[0].is_active) {
      return res.status(401).json({ error: 'Invalid token or user inactive' });
    }

    req.user = users[0];
    req.token = token;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    } else {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
};

module.exports = authMiddleware;
