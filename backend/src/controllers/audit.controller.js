const AuditLog = require('../models/auditLog.model');

const AuditController = {
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const userId = req.query.userId ? parseInt(req.query.userId) : null;
      const entityType = req.query.entityType || null;
      const startDate = req.query.startDate || null;
      const endDate = req.query.endDate || null;

      const result = await AuditLog.findAll(page, limit, userId, entityType, startDate, endDate);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = AuditController;
