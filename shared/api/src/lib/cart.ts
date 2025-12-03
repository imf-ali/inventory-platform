import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  ApiResponse,
  CartResponse,
  AddToCartDto,
  UpdateCartStatusDto,
} from '@inventory-platform/types';

export const cartApi = {
  get: async (): Promise<CartResponse> => {
    const response = await apiClient.get<ApiResponse<CartResponse>>(
      API_ENDPOINTS.CART.BASE
    );
    return response.data;
  },

  add: async (data: AddToCartDto): Promise<CartResponse> => {
    const response = await apiClient.post<ApiResponse<CartResponse>>(
      API_ENDPOINTS.CART.ADD,
      data
    );
    return response.data;
  },

  updateStatus: async (data: UpdateCartStatusDto): Promise<CartResponse> => {
    const response = await apiClient.put<ApiResponse<CartResponse>>(
      API_ENDPOINTS.CART.STATUS,
      data
    );
    return response.data;
  },
};

