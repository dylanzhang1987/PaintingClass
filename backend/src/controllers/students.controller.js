const Joi = require('joi');
const Student = require('../models/student.model');
const Course = require('../models/course.model');

const studentSchema = Joi.object({
  student_number: Joi.string().required(),
  name: Joi.string().min(2).max(100).required(),
  gender: Joi.string().valid('male', 'female', 'other').required(),
  birth_date: Joi.date().allow(null),
  phone: Joi.string().allow(null, ''),
  email: Joi.string().email().allow(null, ''),
  address: Joi.string().allow(null, ''),
  enrollment_date: Joi.date().allow(null),
  guardian_name: Joi.string().allow(null, ''),
  guardian_phone: Joi.string().allow(null, ''),
  notes: Joi.string().allow(null, '')
});

const StudentsController = {
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';

      const result = await Student.findAll(page, limit, search);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const student = await Student.findById(req.params.id);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const enrollments = await Student.getCourseEnrollments(req.params.id);
      res.json({ student, enrollments });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req, res) {
    try {
      const { error, value } = studentSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      // Check if student number already exists
      const existingStudent = await Student.findByStudentNumber(value.student_number);
      if (existingStudent) {
        return res.status(409).json({ error: 'Student number already exists' });
      }

      const studentId = await Student.create(value);
      const student = await Student.findById(studentId);

      res.status(201).json({ student });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const student = await Student.findById(req.params.id);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      await Student.update(req.params.id, {
        ...req.body,
        student_number: student.student_number // Prevent changing student number
      });

      const updatedStudent = await Student.findById(req.params.id);
      res.json({ student: updatedStudent });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      await Student.delete(req.params.id);
      res.json({ message: 'Student deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async enroll(req, res) {
    try {
      const { courseId } = req.body;
      const enrollmentId = await Course.enrollStudent(courseId, req.params.id);
      res.status(201).json({ id: enrollmentId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async withdraw(req, res) {
    try {
      const { courseId } = req.body;
      await Course.withdrawStudent(courseId, req.params.id);
      res.json({ message: 'Student withdrawn from course' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = StudentsController;
