import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type { ApiResponse, InventoryAlert } from './types';

export const alertsApi = {
  getAll: async (): Promise<InventoryAlert[]> => {
    const response = await apiClient.get<ApiResponse<InventoryAlert[]>>(
      API_ENDPOINTS.ALERTS.BASE
    );
    return response.data;
  },

  getInventoryAlerts: async (): Promise<InventoryAlert[]> => {
    const response = await apiClient.get<ApiResponse<InventoryAlert[]>>(
      API_ENDPOINTS.ALERTS.INVENTORY
    );
    return response.data;
  },

  getById: async (id: string): Promise<InventoryAlert> => {
    const response = await apiClient.get<ApiResponse<InventoryAlert>>(
      API_ENDPOINTS.ALERTS.BY_ID(id)
    );
    return response.data;
  },

  markAsResolved: async (id: string): Promise<InventoryAlert> => {
    const response = await apiClient.patch<ApiResponse<InventoryAlert>>(
      API_ENDPOINTS.ALERTS.BY_ID(id),
      { resolved: true }
    );
    return response.data;
  },
};

