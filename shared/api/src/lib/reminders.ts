import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type { ApiResponse, Reminder } from './types';

export const remindersApi = {
  getAll: async (params?: {
    type?: 'sell' | 'return';
    status?: 'pending' | 'completed';
  }): Promise<Reminder[]> => {
    const response = await apiClient.get<ApiResponse<Reminder[]>>(
      API_ENDPOINTS.REMINDERS.BASE,
      params as Record<string, string>
    );
    return response.data;
  },

  getById: async (id: string): Promise<Reminder> => {
    const response = await apiClient.get<ApiResponse<Reminder>>(
      API_ENDPOINTS.REMINDERS.BY_ID(id)
    );
    return response.data;
  },

  getByType: async (type: 'sell' | 'return'): Promise<Reminder[]> => {
    const response = await apiClient.get<ApiResponse<Reminder[]>>(
      API_ENDPOINTS.REMINDERS.BY_TYPE(type)
    );
    return response.data;
  },

  markAsCompleted: async (id: string): Promise<Reminder> => {
    const response = await apiClient.patch<ApiResponse<Reminder>>(
      API_ENDPOINTS.REMINDERS.BY_ID(id),
      { status: 'completed' }
    );
    return response.data;
  },

  create: async (data: Omit<Reminder, 'id' | 'createdAt'>): Promise<Reminder> => {
    const response = await apiClient.post<ApiResponse<Reminder>>(
      API_ENDPOINTS.REMINDERS.BASE,
      data
    );
    return response.data;
  },
};

