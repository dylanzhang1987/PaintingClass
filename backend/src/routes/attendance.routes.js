const express = require('express');
const router = express.Router();
const AttendanceController = require('../controllers/attendance.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { isTeacherOrAdmin } = require('../middlewares/role.middleware');
const { auditMiddleware } = require('../middlewares/audit.middleware');

// All routes require authentication
router.use(authMiddleware);

router.get('/course/:courseId/:date', AttendanceController.getByCourseAndDate);
router.get('/student/:studentId', AttendanceController.getByStudent);
router.post('/', isTeacherOrAdmin, auditMiddleware('create', 'attendance'), AttendanceController.record);
router.put('/:id', isTeacherOrAdmin, auditMiddleware('update', 'attendance'), AttendanceController.update);
router.delete('/:id', isTeacherOrAdmin, auditMiddleware('delete', 'attendance'), AttendanceController.delete);
router.get('/stats/course/:courseId', isTeacherOrAdmin, AttendanceController.getCourseStats);
router.get('/stats/student/:studentId', AttendanceController.getStudentStats);

module.exports = router;
