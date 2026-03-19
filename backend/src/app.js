const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/database.config');
const errorHandler = require('./middlewares/error.middleware');
const { accessLogMiddleware } = require('./middlewares/audit.middleware');

// Import routes
const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const studentsRoutes = require('./routes/students.routes');
const coursesRoutes = require('./routes/courses.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const statisticsRoutes = require('./routes/statistics.routes');
const auditRoutes = require('./routes/audit.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(accessLogMiddleware);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/audit-logs', auditRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
});

module.exports = app;
