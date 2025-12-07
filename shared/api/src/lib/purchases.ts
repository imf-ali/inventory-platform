import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  ApiResponse,
  PurchaseHistoryResponse,
  GetPurchasesParams,
} from '@inventory-platform/types';

export const purchasesApi = {
  getAll: async (params?: GetPurchasesParams): Promise<PurchaseHistoryResponse> => {
    // Convert params to query string format
    const queryParams: Record<string, string> = {};
    if (params?.page !== undefined) {
      queryParams.page = params.page.toString();
    }
    if (params?.limit !== undefined) {
      queryParams.limit = params.limit.toString();
    }
    if (params?.order) {
      queryParams.order = params.order;
    }

    const response = await apiClient.get<ApiResponse<PurchaseHistoryResponse>>(
      API_ENDPOINTS.PURCHASES.BASE,
      queryParams
    );
    // API returns: { success: true, data: { purchases: [...], page, limit, total, totalPages } }
    // apiClient.get already unwraps axios response.data
    // So response is ApiResponse<PurchaseHistoryResponse> = { success: true, data: { ... } }
    // We need to return response.data
    return response.data;
  },
};

