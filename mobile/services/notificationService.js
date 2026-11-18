import api from './api';

export const notificationService = {
  async getMyNotifications() {
    return await api.get('/notifications');
  },

  async markAsRead(id) {
    return await api.put(`/notifications/${id}/read`);
  },

  async markAllAsRead() {
    return await api.put('/notifications/read-all');
  },
};
