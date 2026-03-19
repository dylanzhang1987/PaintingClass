const pool = require('../config/database.config');

const auditMiddleware = (action, entityType) => {
  return async (req, res, next) => {
    const originalSend = res.json;

    res.json = function (data) {
      res.data = data;
      originalSend.call(res, data);
    };

    res.on('finish', async () => {
      if (req.user && res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const entityId = req.params.id || (res.data && res.data.id);

          await pool.query(
            `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values, ip_address, user_agent)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              req.user.id,
              action,
              entityType,
              entityId,
              JSON.stringify(req.body || {}),
              req.ip,
              req.headers['user-agent']
            ]
          );
        } catch (error) {
          console.error('Audit log error:', error);
        }
      }
    });

    next();
  };
};

const accessLogMiddleware = async (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', async () => {
    try {
      await pool.query(
        `INSERT INTO access_logs (user_id, action, endpoint, method, status_code, ip_address, user_agent)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user ? req.user.id : null,
          req.route?.path || req.path,
          req.path,
          req.method,
          res.statusCode,
          req.ip,
          req.headers['user-agent']
        ]
      );
    } catch (error) {
      console.error('Access log error:', error);
    }
  });

  next();
};

module.exports = { auditMiddleware, accessLogMiddleware };
