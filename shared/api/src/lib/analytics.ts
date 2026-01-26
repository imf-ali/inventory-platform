import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type { ApiResponse, SalesAnalytics, ProfitAnalytics, VendorAnalytics, CustomerAnalytics, InventoryAnalytics } from '@inventory-platform/types';

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

  getInventory: async (params?: {
    startDate?: string;
    endDate?: string;
    includeAll?: boolean;
    lowStockThreshold?: number;
    deadStockDays?: number;
    expiringSoonDays?: number;
  }): Promise<InventoryAnalytics> => {
    const queryParams: Record<string, string> = {};
    
    if (params?.startDate) {
      queryParams.startDate = params.startDate;
    }
    if (params?.endDate) {
      queryParams.endDate = params.endDate;
    }
    if (params?.includeAll !== undefined) {
      queryParams.includeAll = params.includeAll.toString();
    }
    if (params?.lowStockThreshold !== undefined) {
      queryParams.lowStockThreshold = params.lowStockThreshold.toString();
    }
    if (params?.deadStockDays !== undefined) {
      queryParams.deadStockDays = params.deadStockDays.toString();
    }
    if (params?.expiringSoonDays !== undefined) {
      queryParams.expiringSoonDays = params.expiringSoonDays.toString();
    }

    const response = await apiClient.get<ApiResponse<InventoryAnalytics>>(
      API_ENDPOINTS.ANALYTICS.INVENTORY,
      queryParams
    );
    return response.data;
  },

  getVendors: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<VendorAnalytics> => {
    const queryParams: Record<string, string> = {};
    
    if (params?.startDate) {
      queryParams.startDate = params.startDate;
    }
    if (params?.endDate) {
      queryParams.endDate = params.endDate;
    }

    const response = await apiClient.get<ApiResponse<VendorAnalytics>>(
      API_ENDPOINTS.ANALYTICS.VENDORS,
      queryParams
    );
    return response.data;
  },

  getCustomers: async (params?: {
    startDate?: string;
    endDate?: string;
    topN?: number;
    includeAll?: boolean;
  }): Promise<CustomerAnalytics> => {
    const queryParams: Record<string, string> = {};
    
    if (params?.startDate) {
      queryParams.startDate = params.startDate;
    }
    if (params?.endDate) {
      queryParams.endDate = params.endDate;
    }
    if (params?.topN !== undefined) {
      queryParams.topN = params.topN.toString();
    }
    if (params?.includeAll !== undefined) {
      queryParams.includeAll = params.includeAll.toString();
    }

    const response = await apiClient.get<ApiResponse<CustomerAnalytics>>(
      API_ENDPOINTS.ANALYTICS.CUSTOMERS,
      queryParams
    );
    return response.data;
  },
};

