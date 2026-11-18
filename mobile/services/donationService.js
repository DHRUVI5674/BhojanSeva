import api from './api';

export const donationService = {
  async getDonations(params = {}) {
    return await api.get('/donations', { params });
  },

  async getDonationById(id) {
    return await api.get(`/donations/${id}`);
  },

  async getMyDonations() {
    return await api.get('/donations/my-donations');
  },

  async createDonation(donationData) {
    return await api.post('/donations', donationData);
  },

  async updateDonation(id, donationData) {
    return await api.put(`/donations/${id}`, donationData);
  },

  async cancelDonation(id, reason = '') {
    return await api.put(`/donations/${id}/cancel`, { reason });
  },
};
