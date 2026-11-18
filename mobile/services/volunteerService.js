import api from './api';

export const volunteerService = {
  async getAvailableTasks() {
    return await api.get('/volunteer/available-tasks');
  },

  async getMyTasks() {
    return await api.get('/volunteer/my-tasks');
  },

  async acceptTask(taskId) {
    return await api.put(`/volunteer/tasks/${taskId}/accept`);
  },

  async confirmPickup(taskId) {
    return await api.put(`/volunteer/tasks/${taskId}/pickup`);
  },

  async confirmDelivery(taskId) {
    return await api.put(`/volunteer/tasks/${taskId}/deliver`);
  },

  async getVolunteerStats() {
    return await api.get('/volunteer/stats');
  },
};
