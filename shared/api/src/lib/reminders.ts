import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  ApiResponse,
  Reminder,
  CreateReminderDto,
  UpdateReminderDto,
} from '@inventory-platform/types';

export interface RemindersListResponse {
  data: Reminder[];
}

export const remindersApi = {
  getAll: async (): Promise<Reminder[]> => {
    const response = await apiClient.get<ApiResponse<RemindersListResponse>>(
      API_ENDPOINTS.REMINDERS.BASE
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<Reminder> => {
    const response = await apiClient.get<ApiResponse<Reminder>>(
      API_ENDPOINTS.REMINDERS.BY_ID(id)
    );
    return response.data;
  },

  create: async (data: CreateReminderDto): Promise<Reminder> => {
    const response = await apiClient.post<ApiResponse<Reminder>>(
      API_ENDPOINTS.REMINDERS.BASE,
      data
    );
    return response.data;
  },

  update: async (id: string, data: UpdateReminderDto): Promise<Reminder> => {
    const response = await apiClient.put<ApiResponse<Reminder>>(
      API_ENDPOINTS.REMINDERS.BY_ID(id),
      data
    );
    return response.data;
  },

  delete: async (id: string): Promise<number> => {
    const response = await apiClient.delete<ApiResponse<number>>(
      API_ENDPOINTS.REMINDERS.BY_ID(id)
    );
    return response.data;
  },
};

