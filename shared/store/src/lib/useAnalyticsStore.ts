import { create } from 'zustand';
import { analyticsApi } from '@inventory-platform/api';
import type { SalesAnalytics, ProfitAnalytics, VendorAnalytics, CustomerAnalytics, InventoryAnalytics } from '@inventory-platform/types';

export interface AnalyticsState {
  data: SalesAnalytics | null;
  profitData: ProfitAnalytics | null;
  vendorData: VendorAnalytics | null;
  customerData: CustomerAnalytics | null;
  inventoryData: InventoryAnalytics | null;
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
  vendorFilters: {
    startDate?: string;
    endDate?: string;
  };
  customerFilters: {
    startDate?: string;
    endDate?: string;
    topN?: number;
    includeAll?: boolean;
  };
  inventoryFilters: {
    includeAll?: boolean;
    lowStockThreshold?: number;
    deadStockDays?: number;
    expiringSoonDays?: number;
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
  fetchVendors: (params?: {
    startDate?: string;
    endDate?: string;
  }) => Promise<void>;
  fetchCustomers: (params?: {
    startDate?: string;
    endDate?: string;
    topN?: number;
    includeAll?: boolean;
  }) => Promise<void>;
  fetchInventory: (params?: {
    includeAll?: boolean;
    lowStockThreshold?: number;
    deadStockDays?: number;
    expiringSoonDays?: number;
  }) => Promise<void>;
  setFilters: (filters: Partial<AnalyticsState['filters']>) => void;
  setProfitFilters: (filters: Partial<AnalyticsState['profitFilters']>) => void;
  setVendorFilters: (filters: Partial<AnalyticsState['vendorFilters']>) => void;
  setCustomerFilters: (filters: Partial<AnalyticsState['customerFilters']>) => void;
  setInventoryFilters: (filters: Partial<AnalyticsState['inventoryFilters']>) => void;
  clearError: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  data: null,
  profitData: null,
  vendorData: null,
  customerData: null,
  inventoryData: null,
  isLoading: false,
  error: null,
  filters: {
    topN: 10,
    compare: false,
  },
  profitFilters: {
    lowMarginThreshold: 10,
  },
  vendorFilters: {},
  customerFilters: {
    topN: 10,
    includeAll: false,
  },
  inventoryFilters: {
    includeAll: false,
    lowStockThreshold: 10,
    deadStockDays: 60,
    expiringSoonDays: 15,
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

  fetchVendors: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const vendorData = await analyticsApi.getVendors(params);
      set({
        vendorData,
        isLoading: false,
        vendorFilters: { ...params },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch vendor analytics';
      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  fetchCustomers: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const customerData = await analyticsApi.getCustomers(params);
      set({
        customerData,
        isLoading: false,
        customerFilters: { ...params },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch customer analytics';
      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  fetchInventory: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const inventoryData = await analyticsApi.getInventory(params);
      set({
        inventoryData,
        isLoading: false,
        inventoryFilters: { ...params },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch inventory analytics';
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

  setVendorFilters: (newFilters) => {
    set((state) => ({
      vendorFilters: { ...state.vendorFilters, ...newFilters },
    }));
  },

  setCustomerFilters: (newFilters) => {
    set((state) => ({
      customerFilters: { ...state.customerFilters, ...newFilters },
    }));
  },

  setInventoryFilters: (newFilters) => {
    set((state) => ({
      inventoryFilters: { ...state.inventoryFilters, ...newFilters },
    }));
  },

  clearError: () => set({ error: null }),
}));

