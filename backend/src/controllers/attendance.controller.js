const Joi = require('joi');
const Attendance = require('../models/attendance.model');
const Course = require('../models/course.model');

const attendanceSchema = Joi.object({
  course_id: Joi.number().integer().required(),
  student_id: Joi.number().integer().required(),
  date: Joi.date().required(),
  status: Joi.string().valid('present', 'absent', 'late', 'excused').required(),
  notes: Joi.string().allow(null, '')
});

const AttendanceController = {
  async getByCourseAndDate(req, res) {
    try {
      const { courseId, date } = req.params;
      const attendance = await Attendance.findByCourseAndDate(courseId, date);
      res.json({ attendance });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getByStudent(req, res) {
    try {
      const { studentId } = req.params;
      const { courseId, startDate, endDate } = req.query;

      const attendance = await Attendance.findByStudent(studentId, courseId, startDate, endDate);
      res.json({ attendance });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async record(req, res) {
    try {
      const { error, value } = attendanceSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      // Check if course exists and user has access
      const course = await Course.findById(value.course_id);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      if (req.user.role === 'teacher' && course.teacher_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const attendanceId = await Attendance.create({
        ...value,
        recorded_by: req.user.id
      });

      const attendance = await Attendance.findById(attendanceId);
      res.status(201).json({ attendance });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const { status, notes } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const attendance = await Attendance.findById(req.params.id);
      if (!attendance) {
        return res.status(404).json({ error: 'Attendance record not found' });
      }

      // Check if user has access
      const course = await Course.findById(attendance.course_id);
      if (req.user.role === 'teacher' && course.teacher_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await Attendance.update(req.params.id, {
        status,
        notes: notes || attendance.notes,
        recorded_by: req.user.id
      });

      const updatedAttendance = await Attendance.findById(req.params.id);
      res.json({ attendance: updatedAttendance });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const attendance = await Attendance.findById(req.params.id);
      if (!attendance) {
        return res.status(404).json({ error: 'Attendance record not found' });
      }

      // Check if user has access
      const course = await Course.findById(attendance.course_id);
      if (req.user.role === 'teacher' && course.teacher_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await Attendance.delete(req.params.id);
      res.json({ message: 'Attendance record deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getCourseStats(req, res) {
    try {
      const { courseId } = req.params;
      const { startDate, endDate } = req.query;

      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      if (req.user.role === 'teacher' && course.teacher_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const stats = await Attendance.getCourseAttendanceStats(courseId, startDate, endDate);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getStudentStats(req, res) {
    try {
      const { studentId } = req.params;
      const { courseId } = req.query;

      const stats = await Attendance.getStudentAttendanceStats(studentId, courseId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = AttendanceController;
