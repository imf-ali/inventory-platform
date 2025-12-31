import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type { ApiResponse, DashboardData } from '@inventory-platform/types';

export const dashboardApi = {
  getDashboard: async (): Promise<DashboardData> => {
    const response = await apiClient.get<ApiResponse<DashboardData>>(
      API_ENDPOINTS.DASHBOARD.BASE
    );
    return response.data;
  },
};

