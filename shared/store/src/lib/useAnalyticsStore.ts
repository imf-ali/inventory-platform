import { create } from 'zustand';
import { analyticsApi } from '@inventory-platform/api';
import type { SalesAnalytics, ProfitAnalytics } from '@inventory-platform/types';

export interface AnalyticsState {
  data: SalesAnalytics | null;
  profitData: ProfitAnalytics | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'product' | 'lotId' | 'company' | null;
    timeSeries?: 'hour' | 'day' | 'week' | 'month' | null;
    topN?: number;
    compare?: boolean;
  };
  profitFilters: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'product' | 'lotId' | 'businessType' | null;
    timeSeries?: 'hour' | 'day' | 'week' | 'month' | null;
    lowMarginThreshold?: number;
  };
  fetchSales: (params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'product' | 'lotId' | 'company' | null;
    timeSeries?: 'hour' | 'day' | 'week' | 'month' | null;
    topN?: number;
    compare?: boolean;
  }) => Promise<void>;
  fetchProfit: (params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'product' | 'lotId' | 'businessType' | null;
    timeSeries?: 'hour' | 'day' | 'week' | 'month' | null;
    lowMarginThreshold?: number;
  }) => Promise<void>;
  setFilters: (filters: Partial<AnalyticsState['filters']>) => void;
  setProfitFilters: (filters: Partial<AnalyticsState['profitFilters']>) => void;
  clearError: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  data: null,
  profitData: null,
  isLoading: false,
  error: null,
  filters: {
    topN: 10,
    compare: false,
  },
  profitFilters: {
    lowMarginThreshold: 10,
  },

  fetchSales: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const data = await analyticsApi.getSales(params);
      set({
        data,
        isLoading: false,
        filters: { ...params },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch analytics';
      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  fetchProfit: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const profitData = await analyticsApi.getProfit(params);
      set({
        profitData,
        isLoading: false,
        profitFilters: { ...params },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profit analytics';
      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  setProfitFilters: (newFilters) => {
    set((state) => ({
      profitFilters: { ...state.profitFilters, ...newFilters },
    }));
  },

  clearError: () => set({ error: null }),
}));

