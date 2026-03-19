import api from './axios';

export const studentsApi = {
  getAll: (page = 1, limit = 10, search = '') =>
    api.get('/students', { params: { page, limit, search } }),

  getById: (id) =>
    api.get(`/students/${id}`),

  create: (studentData) =>
    api.post('/students', studentData),

  update: (id, studentData) =>
    api.put(`/students/${id}`, studentData),

  delete: (id) =>
    api.delete(`/students/${id}`),

  enroll: (id, courseId) =>
    api.post(`/students/${id}/enroll`, { courseId }),

  withdraw: (id, courseId) =>
    api.post(`/students/${id}/withdraw`, { courseId })
};
