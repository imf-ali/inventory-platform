import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  ApiResponse,
  ShopMembership,
  SetActiveShopResponse,
  UserShopsResponse,
} from '@inventory-platform/types';

export const usersApi = {
  getMyShops: async (): Promise<ShopMembership[]> => {
    const response = await apiClient.get<ApiResponse<{ data: ShopMembership[] }>>(
      API_ENDPOINTS.USERS.ME_SHOPS
    );
    // API returns: { success: true, data: { data: [...] } }
    return response.data.data;
  },

  setActiveShop: async (shopId: string): Promise<SetActiveShopResponse> => {
    const response = await apiClient.post<ApiResponse<SetActiveShopResponse>>(
      API_ENDPOINTS.USERS.ACTIVE_SHOP,
      { shopId }
    );
    return response.data;
  },
};
