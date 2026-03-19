import api from './axios';

export const authApi = {
  login: (username, password) =>
    api.post('/auth/login', { username, password }),

  logout: () =>
    api.post('/auth/logout'),

  getCurrentUser: () =>
    api.get('/auth/me'),

  changePassword: (oldPassword, newPassword) =>
    api.post('/auth/change-password', { oldPassword, newPassword })
};
