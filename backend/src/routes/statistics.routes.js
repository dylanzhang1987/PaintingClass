const express = require('express');
const router = express.Router();
const StatisticsController = require('../controllers/statistics.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

router.get('/dashboard', StatisticsController.getDashboard);
router.get('/course/:courseId', StatisticsController.getCourseStats);
router.get('/student/:studentId', StatisticsController.getStudentStats);

module.exports = router;
