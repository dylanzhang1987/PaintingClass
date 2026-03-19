const express = require('express');
const router = express.Router();
const UsersController = require('../controllers/users.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');
const { auditMiddleware } = require('../middlewares/audit.middleware');

// All routes require authentication and admin role
router.use(authMiddleware, isAdmin);

router.get('/', UsersController.getAll);
router.get('/:id', UsersController.getById);
router.post('/', auditMiddleware('create', 'user'), UsersController.create);
router.put('/:id', auditMiddleware('update', 'user'), UsersController.update);
router.delete('/:id', auditMiddleware('delete', 'user'), UsersController.delete);

module.exports = router;
