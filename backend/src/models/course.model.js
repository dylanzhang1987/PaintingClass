const pool = require('../config/database.config');

const Course = {
  async findById(id) {
    const [courses] = await pool.query('SELECT * FROM courses WHERE id = ?', [id]);
    return courses[0];
  },

  async create(courseData) {
    const [result] = await pool.query(
      `INSERT INTO courses (name, description, teacher_id, start_date, end_date, schedule, max_students, level, fee)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        courseData.name,
        courseData.description,
        courseData.teacher_id,
        courseData.start_date,
        courseData.end_date,
        courseData.schedule,
        courseData.max_students,
        courseData.level || 'beginner',
        courseData.fee || 0
      ]
    );
    return result.insertId;
  },

  async update(id, courseData) {
    const [result] = await pool.query(
      `UPDATE courses SET name = ?, description = ?, start_date = ?, end_date = ?, schedule = ?, max_students = ?, level = ?, fee = ?, is_active = ?
       WHERE id = ?`,
      [
        courseData.name,
        courseData.description,
        courseData.start_date,
        courseData.end_date,
        courseData.schedule,
        courseData.max_students,
        courseData.level,
        courseData.fee,
        courseData.is_active,
        id
      ]
    );
    return result.affectedRows;
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM courses WHERE id = ?', [id]);
    return result.affectedRows;
  },

  async findAll(page = 1, limit = 10, search = '', userId = null, userRole = null) {
    const offset = (page - 1) * limit;
    let query = 'SELECT c.*, u.full_name as teacher_name FROM courses c JOIN users u ON c.teacher_id = u.id WHERE c.is_active = TRUE';
    let params = [];

    // Teachers can only see their own courses
    if (userRole === 'teacher' && userId) {
      query += ' AND c.teacher_id = ?';
      params.push(userId);
    }

    if (search) {
      query += ' AND (c.name LIKE ? OR c.description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [courses] = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM courses WHERE is_active = TRUE';
    const countParams = [];
    if (userRole === 'teacher' && userId) {
      countQuery += ' AND teacher_id = ?';
      countParams.push(userId);
    }
    if (search) {
      countQuery += ' AND (name LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm);
    }
    const [count] = await pool.query(countQuery, countParams);

    return { courses, total: count[0].total, page, limit };
  },

  async getEnrolledStudents(courseId) {
    const [students] = await pool.query(
      `SELECT s.*, ce.enrollment_date, ce.status, ce.notes as enrollment_notes
       FROM students s
       JOIN course_enrollments ce ON s.id = ce.student_id
       WHERE ce.course_id = ? AND ce.status = 'active'`,
      [courseId]
    );
    return students;
  },

  async enrollStudent(courseId, studentId) {
    const [result] = await pool.query(
      `INSERT INTO course_enrollments (course_id, student_id, enrollment_date, status)
       VALUES (?, ?, ?, 'active')
       ON DUPLICATE KEY UPDATE status = 'active'`,
      [courseId, studentId, new Date().toISOString().split('T')[0]]
    );
    return result.insertId;
  },

  async withdrawStudent(courseId, studentId) {
    const [result] = await pool.query(
      'UPDATE course_enrollments SET status = "withdrawn" WHERE course_id = ? AND student_id = ?',
      [courseId, studentId]
    );
    return result.affectedRows;
  },

  async getStudentCount(courseId) {
    const [result] = await pool.query(
      'SELECT COUNT(*) as count FROM course_enrollments WHERE course_id = ? AND status = "active"',
      [courseId]
    );
    return result[0].count;
  }
};

module.exports = Course;
