import api from './axios';

export const attendanceApi = {
  getByCourseAndDate: (courseId, date) =>
    api.get(`/attendance/course/${courseId}/${date}`),

  getByStudent: (studentId, courseId, startDate, endDate) =>
    api.get(`/attendance/student/${studentId}`, { params: { courseId, startDate, endDate } }),

  record: (attendanceData) =>
    api.post('/attendance', attendanceData),

  update: (id, attendanceData) =>
    api.put(`/attendance/${id}`, attendanceData),

  delete: (id) =>
    api.delete(`/attendance/${id}`),

  getCourseStats: (courseId, startDate, endDate) =>
    api.get(`/attendance/stats/course/${courseId}`, { params: { startDate, endDate } }),

  getStudentStats: (studentId, courseId) =>
    api.get(`/attendance/stats/student/${studentId}`, { params: { courseId } })
};
