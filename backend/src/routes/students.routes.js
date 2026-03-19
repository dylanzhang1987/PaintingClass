const express = require('express');
const router = express.Router();
const StudentsController = require('../controllers/students.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { isTeacherOrAdmin } = require('../middlewares/role.middleware');
const { auditMiddleware } = require('../middlewares/audit.middleware');

// All routes require authentication
router.use(authMiddleware);

router.get('/', StudentsController.getAll);
router.get('/:id', StudentsController.getById);
router.post('/', auditMiddleware('create', 'student'), StudentsController.create);
router.put('/:id', auditMiddleware('update', 'student'), StudentsController.update);
router.delete('/:id', auditMiddleware('delete', 'student'), StudentsController.delete);
router.post('/:id/enroll', isTeacherOrAdmin, StudentsController.enroll);
router.post('/:id/withdraw', isTeacherOrAdmin, StudentsController.withdraw);

module.exports = router;
