import api, { saveToken, removeToken } from './api';

export const authService = {
  async register(userData) {
    const data = await api.post('/auth/register', userData);
    if (data.token) {
      await saveToken(data.token);
    }
    return data;
  },

  async login(credentials) {
    const data = await api.post('/auth/login', credentials);
    if (data.token) {
      await saveToken(data.token);
    }
    return data;
  },

  async getMe() {
    return await api.get('/auth/me');
  },

  async updateProfile(profileData) {
    return await api.put('/auth/profile', profileData);
  },

  async changePassword(passwordData) {
    return await api.put('/auth/change-password', passwordData);
  },

  async forgotPassword(email) {
    return await api.post('/auth/forgot-password', { email });
  },

  async logout() {
    await removeToken();
  },
};
