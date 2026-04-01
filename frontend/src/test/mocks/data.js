/**
 * Mock student data
 */
export const mockStudents = {
  students: [
    {
      id: 1,
      student_number: 'STU001',
      name: '张三',
      gender: 'male',
      phone: '13800138000',
      email: 'zhangsan@example.com',
      address: '北京市朝阳区',
      birth_date: '2010-01-01',
      enrollment_date: '2024-09-01',
      enrollment_count: 2
    },
    {
      id: 2,
      student_number: 'STU002',
      name: '李四',
      gender: 'female',
      phone: '13800138001',
      email: 'lisi@example.com',
      address: '北京市海淀区',
      birth_date: '2010-05-15',
      enrollment_date: '2024-09-01',
      enrollment_count: 1
    }
  ],
  total: 2,
  page: 1,
  limit: 10
}

/**
 * Mock course data
 */
export const mockCourses = {
  courses: [
    {
      id: 1,
      name: '素描基础',
      teacher_id: 1,
      teacher_name: '王老师',
      day_of_week: 1,
      start_time: '09:00',
      end_time: '10:30',
      max_students: 10,
      current_students: 5,
      status: 'active'
    },
    {
      id: 2,
      name: '水彩入门',
      teacher_id: 2,
      teacher_name: '李老师',
      day_of_week: 3,
      start_time: '14:00',
      end_time: '15:30',
      max_students: 8,
      current_students: 6,
      status: 'active'
    }
  ],
  total: 2
}

/**
 * Mock user data
 */
export const mockUser = {
  id: 1,
  username: 'admin',
  full_name: 'Admin User',
  role: 'super_admin',
  email: 'admin@example.com',
  is_active: true
}

/**
 * Mock auth response
 */
export const mockAuthResponse = {
  token: 'mock-jwt-token',
  user: mockUser
}

/**
 * Mock error response
 */
export const mockErrorResponse = {
  error: 'Invalid credentials'
}

/**
 * Mock attendance data
 */
export const mockAttendance = {
  records: [
    {
      id: 1,
      student_id: 1,
      course_id: 1,
      date: '2024-10-15',
      status: 'present',
      student_name: '张三',
      course_name: '素描基础'
    }
  ],
  total: 1
}
