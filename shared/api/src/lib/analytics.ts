import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type { ApiResponse, SalesAnalytics, ProfitAnalytics } from '@inventory-platform/types';

export const analyticsApi = {
  getSales: async (params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'product' | 'lotId' | 'company' | null;
    timeSeries?: 'hour' | 'day' | 'week' | 'month' | null;
    topN?: number;
    compare?: boolean;
  }): Promise<SalesAnalytics> => {
    const queryParams: Record<string, string> = {};
    
    if (params?.startDate) {
      queryParams.startDate = params.startDate;
    }
    if (params?.endDate) {
      queryParams.endDate = params.endDate;
    }
    if (params?.groupBy !== null && params?.groupBy !== undefined) {
      queryParams.groupBy = params.groupBy;
    }
    if (params?.timeSeries !== null && params?.timeSeries !== undefined) {
      queryParams.timeSeries = params.timeSeries;
    }
    if (params?.topN !== undefined) {
      queryParams.topN = params.topN.toString();
    }
    if (params?.compare !== undefined) {
      queryParams.compare = params.compare.toString();
    }

    const response = await apiClient.get<ApiResponse<SalesAnalytics>>(
      API_ENDPOINTS.ANALYTICS.SALES,
      queryParams
    );
    return response.data;
  },

  getProfit: async (params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'product' | 'lotId' | 'businessType' | null;
    timeSeries?: 'hour' | 'day' | 'week' | 'month' | null;
    lowMarginThreshold?: number;
  }): Promise<ProfitAnalytics> => {
    const queryParams: Record<string, string> = {};
    
    if (params?.startDate) {
      queryParams.startDate = params.startDate;
    }
    if (params?.endDate) {
      queryParams.endDate = params.endDate;
    }
    if (params?.groupBy !== null && params?.groupBy !== undefined) {
      queryParams.groupBy = params.groupBy;
    }
    if (params?.timeSeries !== null && params?.timeSeries !== undefined) {
      queryParams.timeSeriesGranularity = params.timeSeries;
    }
    if (params?.lowMarginThreshold !== undefined) {
      queryParams.lowMarginThreshold = params.lowMarginThreshold.toString();
    }

    const response = await apiClient.get<ApiResponse<ProfitAnalytics>>(
      API_ENDPOINTS.ANALYTICS.PROFIT,
      queryParams
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

