import api from './axios';

export const coursesApi = {
  getAll: (page = 1, limit = 10, search = '') =>
    api.get('/courses', { params: { page, limit, search } }),

  getById: (id) =>
    api.get(`/courses/${id}`),

  create: (courseData) =>
    api.post('/courses', courseData),

  update: (id, courseData) =>
    api.put(`/courses/${id}`, courseData),

  delete: (id) =>
    api.delete(`/courses/${id}`),

  getStudents: (id) =>
    api.get(`/courses/${id}/students`),

  enrollStudent: (id, studentId) =>
    api.post(`/courses/${id}/enroll`, { studentId }),

  withdrawStudent: (id, studentId) =>
    api.post(`/courses/${id}/withdraw`, { studentId })
};
