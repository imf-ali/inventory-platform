import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  ApiResponse,
  CreateRefundDto,
  RefundResponse,
  GetRefundsParams,
  GetRefundsResponse,
  SearchPurchasesParams,
  SearchPurchasesResponse,
} from '@inventory-platform/types';

export const refundsApi = {
  searchPurchases: async (
    params: SearchPurchasesParams
  ): Promise<SearchPurchasesResponse> => {
    const queryParams: Record<string, string> = {};
    if (params.customerEmail) {
      queryParams.customerEmail = params.customerEmail;
    }
    if (params.customerPhone) {
      queryParams.customerPhone = params.customerPhone;
    }
    if (params.customerName) {
      queryParams.customerName = params.customerName;
    }
    if (params.invoiceNo) {
      queryParams.invoiceNo = params.invoiceNo;
    }
    if (params.page) {
      queryParams.page = String(params.page);
    }
    if (params.limit) {
      queryParams.limit = String(params.limit);
    }

    const response = await apiClient.get<ApiResponse<SearchPurchasesResponse>>(
      API_ENDPOINTS.PURCHASES.SEARCH,
      queryParams
    );
    return response.data;
  },

  create: async (data: CreateRefundDto): Promise<RefundResponse> => {
    const response = await apiClient.post<ApiResponse<RefundResponse>>(
      API_ENDPOINTS.REFUNDS.BASE,
      data
    );
    return response.data;
  },

  getAll: async (params?: GetRefundsParams): Promise<GetRefundsResponse> => {
    const queryParams: Record<string, string> = {};
    if (params?.page) {
      queryParams.page = String(params.page);
    }
    if (params?.limit) {
      queryParams.limit = String(params.limit);
    }
    if (params?.invoiceNo) {
      queryParams.invoiceNo = params.invoiceNo;
    }
    if (params?.customerPhone) {
      queryParams.customerPhone = params.customerPhone;
    }
    if (params?.customerId) {
      queryParams.customerId = params.customerId;
    }
    if (params?.customerEmail) {
      queryParams.customerEmail = params.customerEmail;
    }

    const response = await apiClient.get<ApiResponse<GetRefundsResponse>>(
      API_ENDPOINTS.REFUNDS.BASE,
      queryParams
    );
    return response.data;
  },
};

