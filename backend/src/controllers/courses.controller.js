const Joi = require('joi');
const Course = require('../models/course.model');

const courseSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().allow(null, ''),
  teacher_id: Joi.number().integer().required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().required(),
  schedule: Joi.string().allow(null, ''),
  max_students: Joi.number().integer().allow(null),
  level: Joi.string().valid('beginner', 'intermediate', 'advanced'),
  fee: Joi.number().allow(null)
});

const CoursesController = {
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';

      const result = await Course.findAll(page, limit, search, req.user?.id, req.user?.role);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const course = await Course.findById(req.params.id);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      // Check if user has access to this course
      if (req.user.role === 'teacher' && course.teacher_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const students = await Course.getEnrolledStudents(req.params.id);
      res.json({ course, students });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req, res) {
    try {
      const { error, value } = courseSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      // Teachers can only create courses for themselves
      if (req.user.role === 'teacher') {
        value.teacher_id = req.user.id;
      }

      const courseId = await Course.create(value);
      const course = await Course.findById(courseId);

      res.status(201).json({ course });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const course = await Course.findById(req.params.id);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      // Teachers can only update their own courses
      if (req.user.role === 'teacher' && course.teacher_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const updateData = { ...req.body };
      // Prevent changing teacher_id for teachers
      if (req.user.role === 'teacher') {
        delete updateData.teacher_id;
      } else if (!updateData.teacher_id) {
        updateData.teacher_id = course.teacher_id;
      }

      await Course.update(req.params.id, updateData);
      const updatedCourse = await Course.findById(req.params.id);

      res.json({ course: updatedCourse });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const course = await Course.findById(req.params.id);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      // Teachers can only delete their own courses
      if (req.user.role === 'teacher' && course.teacher_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await Course.delete(req.params.id);
      res.json({ message: 'Course deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getStudents(req, res) {
    try {
      const course = await Course.findById(req.params.id);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      // Teachers can only view students in their own courses
      if (req.user.role === 'teacher' && course.teacher_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const students = await Course.getEnrolledStudents(req.params.id);
      res.json({ students });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async enrollStudent(req, res) {
    try {
      const { studentId } = req.body;
      const course = await Course.findById(req.params.id);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      // Teachers can only enroll students in their own courses
      if (req.user.role === 'teacher' && course.teacher_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const enrollmentId = await Course.enrollStudent(req.params.id, studentId);
      res.status(201).json({ id: enrollmentId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async withdrawStudent(req, res) {
    try {
      const { studentId } = req.body;
      const course = await Course.findById(req.params.id);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      // Teachers can only withdraw students from their own courses
      if (req.user.role === 'teacher' && course.teacher_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await Course.withdrawStudent(req.params.id, studentId);
      res.json({ message: 'Student withdrawn from course' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = CoursesController;
