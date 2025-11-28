import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type { ApiResponse, SalesAnalytics } from './types';

export const analyticsApi = {
  getSales: async (params?: {
    startDate?: string;
    endDate?: string;
    period?: 'day' | 'week' | 'month' | 'year';
  }): Promise<SalesAnalytics> => {
    const response = await apiClient.get<ApiResponse<SalesAnalytics>>(
      API_ENDPOINTS.ANALYTICS.SALES,
      params as Record<string, string>
    );
    return response.data;
  },

  getInventory: async (): Promise<{
    totalProducts: number;
    totalValue: number;
    lowStockCount: number;
    categories: { name: string; count: number }[];
  }> => {
    const response = await apiClient.get<
      ApiResponse<{
        totalProducts: number;
        totalValue: number;
        lowStockCount: number;
        categories: { name: string; count: number }[];
      }>
    >(API_ENDPOINTS.ANALYTICS.INVENTORY);
    return response.data;
  },
};

