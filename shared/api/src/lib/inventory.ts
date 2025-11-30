import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  ApiResponse,
  CreateInventoryDto,
  InventoryResponse,
  InventoryListResponse,
} from '@inventory-platform/types';

export const inventoryApi = {
  create: async (data: CreateInventoryDto): Promise<InventoryResponse> => {
    const response = await apiClient.post<ApiResponse<InventoryResponse>>(
      API_ENDPOINTS.INVENTORY.BASE,
      data
    );
    return response.data;
  },

  getAll: async (): Promise<InventoryListResponse> => {
    const response = await apiClient.get<ApiResponse<InventoryListResponse>>(
      API_ENDPOINTS.INVENTORY.BASE
    );
    return response.data;
  },

  search: async (query: string): Promise<InventoryListResponse> => {
    const response = await apiClient.get<ApiResponse<InventoryListResponse>>(
      API_ENDPOINTS.INVENTORY.SEARCH,
      { q: query }
    );
    return response.data;
  },
};

