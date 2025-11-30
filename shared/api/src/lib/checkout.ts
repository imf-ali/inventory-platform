import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  ApiResponse,
  CreateCheckoutDto,
  CheckoutResponse,
} from '@inventory-platform/types';

export const checkoutApi = {
  create: async (data: CreateCheckoutDto): Promise<CheckoutResponse> => {
    const response = await apiClient.post<ApiResponse<CheckoutResponse>>(
      API_ENDPOINTS.CHECKOUT.BASE,
      data
    );
    return response.data;
  },
};

