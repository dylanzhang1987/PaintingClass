const pool = require('../config/database.config');

const AuditLog = {
  async create(logData) {
    const [result] = await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        logData.user_id,
        logData.action,
        logData.entity_type,
        logData.entity_id,
        logData.old_values ? JSON.stringify(logData.old_values) : null,
        logData.new_values ? JSON.stringify(logData.new_values) : null,
        logData.ip_address,
        logData.user_agent
      ]
    );
    return result.insertId;
  },

  async findAll(page = 1, limit = 50, userId = null, entityType = null, startDate = null, endDate = null) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT al.*, u.username, u.full_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (userId) {
      query += ' AND al.user_id = ?';
      params.push(userId);
    }

    if (entityType) {
      query += ' AND al.entity_type = ?';
      params.push(entityType);
    }

    if (startDate) {
      query += ' AND al.created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND al.created_at <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [logs] = await pool.query(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM audit_logs
      WHERE 1=1
    `;
    const countParams = [];
    if (userId) {
      countQuery += ' AND user_id = ?';
      countParams.push(userId);
    }
    if (entityType) {
      countQuery += ' AND entity_type = ?';
      countParams.push(entityType);
    }
    if (startDate) {
      countQuery += ' AND created_at >= ?';
      countParams.push(startDate);
    }
    if (endDate) {
      countQuery += ' AND created_at <= ?';
      countParams.push(endDate);
    }
    const [count] = await pool.query(countQuery, countParams);

    return { logs, total: count[0].total, page, limit };
  }
};

module.exports = AuditLog;
