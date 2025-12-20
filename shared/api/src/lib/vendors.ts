import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  ApiResponse,
  VendorResponse,
  CreateVendorDto,
} from '@inventory-platform/types';

export const vendorsApi = {
  create: async (data: CreateVendorDto): Promise<VendorResponse> => {
    const response = await apiClient.post<ApiResponse<VendorResponse>>(
      API_ENDPOINTS.VENDORS.BASE,
      data
    );
    return response.data;
  },

  searchByPhone: async (phone: string): Promise<VendorResponse | null> => {
    try {
      const response = await apiClient.get<ApiResponse<VendorResponse>>(
        API_ENDPOINTS.VENDORS.SEARCH,
        { phone }
      );
      return response.data;
    } catch (error: any) {
      // If vendor not found, return null instead of throwing
      if (error?.status === 404) {
        return null;
      }
      throw error;
    }
  },
};

