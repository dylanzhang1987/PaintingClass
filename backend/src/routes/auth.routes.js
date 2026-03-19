const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Public routes
router.post('/login', AuthController.login);

// Protected routes
router.post('/logout', authMiddleware, AuthController.logout);
router.get('/me', authMiddleware, AuthController.getCurrentUser);
router.post('/change-password', authMiddleware, AuthController.changePassword);

module.exports = router;
