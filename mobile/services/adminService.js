import api from './api';

export const adminService = {
  async getStats() {
    return await api.get('/admin/stats');
  },

  async getAllUsers(params = {}) {
    return await api.get('/admin/users', { params });
  },

  async updateUserStatus(id, updateData) {
    return await api.put(`/admin/users/${id}/status`, updateData);
  },

  async deleteUser(id) {
    return await api.delete(`/admin/users/${id}`);
  },

  async getAllDonations(params = {}) {
    return await api.get('/admin/donations', { params });
  },

  async getAllVolunteers() {
    return await api.get('/admin/volunteers');
  },
};
