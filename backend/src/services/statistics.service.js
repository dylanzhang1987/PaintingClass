const pool = require('../config/database.config');

const StatisticsService = {
  async getDashboardStats(userId, userRole) {
    let courseFilter = '';
    const params = [];

    if (userRole === 'teacher') {
      courseFilter = 'WHERE c.teacher_id = ?';
      params.push(userId);
    }

    const [studentCount] = await pool.query('SELECT COUNT(*) as count FROM students WHERE is_active = 1');
    const [courseCount] = await pool.query('SELECT COUNT(*) as count FROM courses WHERE is_active = 1');
    const [enrollmentCount] = await pool.query('SELECT COUNT(*) as count FROM course_enrollments WHERE status = "active"');
    const [attendanceStats] = await pool.query('SELECT COUNT(*) as total, SUM(CASE WHEN status = "present" THEN 1 ELSE 0 END) as present, SUM(CASE WHEN status = "absent" THEN 1 ELSE 0 END) as absent FROM attendance_records');
    const [recentActivity] = await pool.query('SELECT al.*, u.username, u.full_name FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id ORDER BY al.created_at DESC LIMIT 10');

    return {
      students: studentCount[0].count,
      courses: courseCount[0].count,
      enrollments: enrollmentCount[0].count,
      attendance: attendanceStats[0],
      recentActivity
    };
  },

  async getCourseStatistics(courseId) {
    const [courses] = await pool.query('SELECT * FROM courses WHERE id = ?', [courseId]);
    if (!courses.length) throw new Error('Course not found');
    return { course: courses[0] };
  },

  async getStudentStatistics(studentId) {
    const [students] = await pool.query('SELECT * FROM students WHERE id = ?', [studentId]);
    if (!students.length) throw new Error('Student not found');
    return { student: students[0] };
  },

  async getSystemStatistics() {
    const [userCount] = await pool.query('SELECT COUNT(*) as count FROM users');
    const [studentCount] = await pool.query('SELECT COUNT(*) as count FROM students WHERE is_active = 1');
    const [courseCount] = await pool.query('SELECT COUNT(*) as count FROM courses WHERE is_active = 1');
    const [enrollmentCount] = await pool.query('SELECT COUNT(*) as count FROM course_enrollments WHERE status = "active"');
    const [attendanceCount] = await pool.query('SELECT COUNT(*) as count FROM attendance_records');

    return {
      users: userCount[0].count,
      students: studentCount[0].count,
      courses: courseCount[0].count,
      enrollments: enrollmentCount[0].count,
      attendanceRecords: attendanceCount[0].count
    };
  }
};

module.exports = StatisticsService;
