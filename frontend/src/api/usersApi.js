import api from './axios';

export const usersApi = {
  getAll: (page = 1, limit = 10, search = '') =>
    api.get('/users', { params: { page, limit, search } }),

  getById: (id) =>
    api.get(`/users/${id}`),

  create: (userData) =>
    api.post('/users', userData),

  update: (id, userData) =>
    api.put(`/users/${id}`, userData),

  delete: (id) =>
    api.delete(`/users/${id}`)
};
