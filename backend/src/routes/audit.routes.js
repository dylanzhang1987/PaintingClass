const express = require('express');
const router = express.Router();
const AuditController = require('../controllers/audit.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');

// All routes require authentication and admin role
router.use(authMiddleware, isAdmin);

router.get('/', AuditController.getAll);

module.exports = router;
