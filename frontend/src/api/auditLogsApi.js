import api from './axios';

export const auditLogsApi = {
  getAll: (page = 1, limit = 10, filters = {}) =>
    api.get('/audit-logs', { params: { page, limit, ...filters } }),

  getById: (id) =>
    api.get(`/audit-logs/${id}`),

  getByUser: (userId, page = 1, limit = 10) =>
    api.get('/audit-logs', { params: { page, limit, user_id: userId } }),

  getByEntity: (entityType, entityId, page = 1, limit = 10) =>
    api.get('/audit-logs', { params: { page, limit, entity_type: entityType, entity_id: entityId } })
};
