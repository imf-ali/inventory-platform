import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type { RegisterShopDto, RegisterShopResponse } from './types';

export const shopsApi = {
  register: async (data: RegisterShopDto): Promise<RegisterShopResponse> => {
    const response = await apiClient.post<{ success: boolean; data: RegisterShopResponse }>(
      API_ENDPOINTS.SHOPS.REGISTER,
      data
    );
    // API returns: { success: true, data: { shopId, status } }
    // axios returns response.data which is the entire response body
    // So response = { success: true, data: { shopId, status } }
    // We need to return response.data
    return response.data;
  },
};

