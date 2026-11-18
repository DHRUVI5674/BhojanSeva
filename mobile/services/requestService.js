import api from './api';

export const requestService = {
  async createRequest(requestData) {
    return await api.post('/requests', requestData);
  },

  async getMyRequests() {
    return await api.get('/requests/my-requests');
  },

  async getIncomingRequests() {
    return await api.get('/requests/incoming');
  },

  async getRequestById(id) {
    return await api.get(`/requests/${id}`);
  },

  async updateRequestStatus(id, status, donorNotes = '') {
    return await api.put(`/requests/${id}/status`, { status, donorNotes });
  },

  async cancelRequest(id) {
    return await api.put(`/requests/${id}/cancel`);
  },
};
