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

  search: async (
    query: string,
    page?: number,
    size?: number
  ): Promise<InventoryListResponse> => {
    const params: Record<string, string> = { q: query };
    if (page !== undefined) {
      params.page = String(page);
    }
    if (size !== undefined) {
      params.size = String(size);
    }
    const response = await apiClient.get<ApiResponse<InventoryListResponse>>(
      API_ENDPOINTS.INVENTORY.SEARCH,
      params
    );
    // The API returns { success: true, data: { data: [...], meta: null, page: {...} } }
    // apiClient.get returns r.data which is the full response body: { success: true, data: {...} }
    // So response is ApiResponse<InventoryListResponse> = { success: true, data: InventoryListResponse }
    // response.data is InventoryListResponse = { data: InventoryItem[], meta: unknown | null, page: {...} }
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

  updateThreshold: async (
    inventoryId: string,
    thresholdCount: number
  ): Promise<void> => {
    await apiClient.put<ApiResponse<void>>(
      API_ENDPOINTS.INVENTORY.BY_ID(inventoryId),
      { thresholdCount }
    );
  },
};
