const express = require('express');
const router = express.Router();
const CoursesController = require('../controllers/courses.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { isTeacherOrAdmin } = require('../middlewares/role.middleware');
const { auditMiddleware } = require('../middlewares/audit.middleware');

// All routes require authentication
router.use(authMiddleware);

router.get('/', CoursesController.getAll);
router.get('/:id', CoursesController.getById);
router.post('/', isTeacherOrAdmin, auditMiddleware('create', 'course'), CoursesController.create);
router.put('/:id', isTeacherOrAdmin, auditMiddleware('update', 'course'), CoursesController.update);
router.delete('/:id', isTeacherOrAdmin, auditMiddleware('delete', 'course'), CoursesController.delete);
router.get('/:id/students', isTeacherOrAdmin, CoursesController.getStudents);
router.post('/:id/enroll', isTeacherOrAdmin, CoursesController.enrollStudent);
router.post('/:id/withdraw', isTeacherOrAdmin, CoursesController.withdrawStudent);

module.exports = router;
