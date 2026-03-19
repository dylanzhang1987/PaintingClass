const StatisticsService = require('../services/statistics.service');

const StatisticsController = {
  async getDashboard(req, res) {
    try {
      const stats = await StatisticsService.getDashboardStats(req.user.id, req.user.role);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getCourseStats(req, res) {
    try {
      const stats = await StatisticsService.getCourseStatistics(req.params.courseId);
      res.json(stats);
    } catch (error) {
      if (error.message === 'Course not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  },

  async getStudentStats(req, res) {
    try {
      const stats = await StatisticsService.getStudentStatistics(req.params.studentId);
      res.json(stats);
    } catch (error) {
      if (error.message === 'Student not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  },

  async getSystemStats(req, res) {
    try {
      const stats = await StatisticsService.getSystemStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = StatisticsController;
