const pool = require('../config/database.config');

const Attendance = {
  async findById(id) {
    const [attendance] = await pool.query('SELECT * FROM attendance_records WHERE id = ?', [id]);
    return attendance[0];
  },

  async create(attendanceData) {
    const [result] = await pool.query(
      `INSERT INTO attendance_records (course_id, student_id, date, status, notes, recorded_by)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE status = ?, notes = ?, recorded_by = ?`,
      [
        attendanceData.course_id,
        attendanceData.student_id,
        attendanceData.date,
        attendanceData.status,
        attendanceData.notes,
        attendanceData.recorded_by,
        attendanceData.status,
        attendanceData.notes,
        attendanceData.recorded_by
      ]
    );
    return result.insertId;
  },

  async update(id, attendanceData) {
    const [result] = await pool.query(
      'UPDATE attendance_records SET status = ?, notes = ?, recorded_by = ? WHERE id = ?',
      [attendanceData.status, attendanceData.notes, attendanceData.recorded_by, id]
    );
    return result.affectedRows;
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM attendance_records WHERE id = ?', [id]);
    return result.affectedRows;
  },

  async findByCourseAndDate(courseId, date) {
    const [attendance] = await pool.query(
      `SELECT ar.*, s.name as student_name, s.student_number
       FROM attendance_records ar
       JOIN students s ON ar.student_id = s.id
       WHERE ar.course_id = ? AND ar.date = ?`,
      [courseId, date]
    );
    return attendance;
  },

  async findByStudent(studentId, courseId = null, startDate = null, endDate = null) {
    let query = `
      SELECT ar.*, c.name as course_name, u.full_name as recorded_by_name
      FROM attendance_records ar
      JOIN courses c ON ar.course_id = c.id
      JOIN users u ON ar.recorded_by = u.id
      WHERE ar.student_id = ?
    `;
    const params = [studentId];

    if (courseId) {
      query += ' AND ar.course_id = ?';
      params.push(courseId);
    }

    if (startDate) {
      query += ' AND ar.date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND ar.date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY ar.date DESC';

    const [attendance] = await pool.query(query, params);
    return attendance;
  },

  async getCourseAttendanceStats(courseId, startDate = null, endDate = null) {
    let query = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late,
        SUM(CASE WHEN status = 'excused' THEN 1 ELSE 0 END) as excused
      FROM attendance_records
      WHERE course_id = ?
    `;
    const params = [courseId];

    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    const [stats] = await pool.query(query, params);
    return stats[0];
  },

  async getStudentAttendanceStats(studentId, courseId = null) {
    let query = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late,
        SUM(CASE WHEN status = 'excused' THEN 1 ELSE 0 END) as excused
      FROM attendance_records
      WHERE student_id = ?
    `;
    const params = [studentId];

    if (courseId) {
      query += ' AND course_id = ?';
      params.push(courseId);
    }

    const [stats] = await pool.query(query, params);
    return stats[0];
  }
};

module.exports = Attendance;
