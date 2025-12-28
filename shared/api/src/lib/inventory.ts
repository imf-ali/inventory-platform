import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  ApiResponse,
  CreateInventoryDto,
  InventoryResponse,
  InventoryListResponse,
  LotsListResponse,
  PaginationInventoryResponse,
} from '@inventory-platform/types';

export const inventoryApi = {
  create: async (data: CreateInventoryDto): Promise<InventoryResponse> => {
    const response = await apiClient.post<ApiResponse<InventoryResponse>>(
      API_ENDPOINTS.INVENTORY.BASE,
      data
    );
    return response.data;
  },

  getAll: async (page = 0, size = 10): Promise<PaginationInventoryResponse> => {
    const response = await apiClient.get<
      ApiResponse<PaginationInventoryResponse>
    >(API_ENDPOINTS.INVENTORY.BASE, {
      page: String(page),
      size: String(size),
    });
    return response.data;
  },

  getLowStock: async (
    page = 0,
    size = 10
  ): Promise<PaginationInventoryResponse> => {
    const response = await apiClient.get<
      ApiResponse<PaginationInventoryResponse>
    >(API_ENDPOINTS.INVENTORY.LOW_STOCK, {
      page: String(page),
      size: String(size),
    });
    return response.data;
  },

  search: async (query: string): Promise<InventoryListResponse> => {
    const response = await apiClient.get<ApiResponse<InventoryListResponse>>(
      API_ENDPOINTS.INVENTORY.SEARCH,
      { q: query }
    );
    return response.data;
  },

  searchLots: async (
    search: string,
    page = 0,
    size = 10
  ): Promise<LotsListResponse> => {
    const response = await apiClient.get<ApiResponse<LotsListResponse>>(
      API_ENDPOINTS.INVENTORY.LOTS,
      { search, page: String(page), size: String(size) }
    );
    return response.data;
  },
};
