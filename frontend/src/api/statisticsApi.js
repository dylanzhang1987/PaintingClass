import api from './axios';

export const statisticsApi = {
  getDashboard: () =>
    api.get('/statistics/dashboard'),

  getCourseStats: (courseId) =>
    api.get(`/statistics/course/${courseId}`),

  getStudentStats: (studentId) =>
    api.get(`/statistics/student/${studentId}`)
};
