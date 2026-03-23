const pool = require('../config/database.config');

const Student = {
  async findById(id) {
    const [students] = await pool.query('SELECT * FROM students WHERE id = ?', [id]);
    return students[0];
  },

  async findByStudentNumber(studentNumber) {
    const [students] = await pool.query('SELECT * FROM students WHERE student_number = ?', [studentNumber]);
    return students[0];
  },

  async create(studentData) {
    const [result] = await pool.query(
      `INSERT INTO students (student_number, name, gender, birth_date, phone, email, address, enrollment_date, guardian_name, guardian_phone, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentData.student_number,
        studentData.name,
        studentData.gender,
        studentData.birth_date,
        studentData.phone,
        studentData.email,
        studentData.address,
        studentData.enrollment_date,
        studentData.guardian_name,
        studentData.guardian_phone,
        studentData.notes
      ]
    );
    return result.insertId;
  },

  async update(id, studentData) {
    const [result] = await pool.query(
      `UPDATE students SET name = ?, gender = ?, birth_date = ?, phone = ?, email = ?, address = ?, guardian_name = ?, guardian_phone = ?, notes = ?, is_active = ?
       WHERE id = ?`,
      [
        studentData.name,
        studentData.gender,
        studentData.birth_date,
        studentData.phone,
        studentData.email,
        studentData.address,
        studentData.guardian_name,
        studentData.guardian_phone,
        studentData.notes,
        studentData.is_active,
        id
      ]
    );
    return result.affectedRows;
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM students WHERE id = ?', [id]);
    return result.affectedRows;
  },

  async findAll(page = 1, limit = 10, search = '') {
    const offset = (page - 1) * limit;
    let query = `
      SELECT s.*,
             (SELECT COUNT(*) FROM course_enrollments WHERE student_id = s.id AND status = 'active') as enrollment_count
      FROM students s
      WHERE s.is_active = TRUE
    `;
    let params = [];

    if (search) {
      query += ' AND (s.student_number LIKE ? OR s.name LIKE ? OR s.email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [students] = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM students WHERE is_active = TRUE';
    if (search) {
      countQuery += ' AND (student_number LIKE ? OR name LIKE ? OR email LIKE ?)';
    }
    const [count] = await pool.query(countQuery, params.slice(0, -2));

    return { students, total: count[0].total, page, limit };
  },

  async bulkCreate(studentsData) {
    if (!studentsData.length) return [];

    const values = studentsData.map(s => [
      s.student_number,
      s.name,
      s.gender || 'other',
      s.birth_date || null,
      s.phone || null,
      s.email || null,
      s.address || null,
      s.enrollment_date || new Date().toISOString().split('T')[0],
      s.guardian_name || null,
      s.guardian_phone || null,
      s.notes || null
    ]);

    const query = `
      INSERT INTO students (student_number, name, gender, birth_date, phone, email, address, enrollment_date, guardian_name, guardian_phone, notes)
      VALUES ?
    `;

    await pool.query(query, [values]);
    return values.length;
  },

  async getCourseEnrollments(studentId) {
    const [enrollments] = await pool
      .query(`
      SELECT c.*, ce.enrollment_date, ce.status, ce.notes as enrollment_notes,
             u.full_name as teacher_name,
             (SELECT COUNT(*) FROM course_enrollments WHERE course_id = c.id AND status = 'active') as student_count
      FROM course_enrollments ce
      JOIN courses c ON ce.course_id = c.id
      JOIN users u ON c.teacher_id = u.id
      WHERE ce.student_id = ? AND ce.status = 'active'
    `, [studentId]);
    return enrollments;
  }
};

module.exports = Student;
