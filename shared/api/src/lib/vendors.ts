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

  search: async (query: string): Promise<VendorResponse[]> => {
    try {
      const response = await apiClient.get<ApiResponse<VendorResponse[]>>(
        API_ENDPOINTS.VENDORS.SEARCH,
        { q: query }
      );
      return response.data || [];
    } catch (error: any) {
      // If vendor not found, return empty array instead of throwing
      if (error?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  getById: async (vendorId: string): Promise<VendorResponse> => {
    const response = await apiClient.get<ApiResponse<VendorResponse>>(
      API_ENDPOINTS.VENDORS.BY_ID(vendorId)
    );
    return response.data;
  },
};

