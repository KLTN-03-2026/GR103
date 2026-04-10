import api from './api';
import { UserProfile } from '../types';

export const userService = {
  async getProfile(): Promise<UserProfile> {
    const response = await api.get<UserProfile>('/user/profile');
    return response.data;
  },

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const response = await api.put<UserProfile>('/user/profile', data);
    return response.data;
  }
};
