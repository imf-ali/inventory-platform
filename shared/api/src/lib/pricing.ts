import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  ApiResponse,
  PatchPricingDto,
  BulkPricingUpdateDto,
  PricingResponse,
} from '@inventory-platform/types';

export const pricingApi = {
  /** Fetch a single pricing document (required before editing rates to avoid accidental removal). */
  getById: async (pricingId: string): Promise<PricingResponse> => {
    const response = await apiClient.get<ApiResponse<PricingResponse>>(
      API_ENDPOINTS.PRICING.BY_ID(pricingId)
    );
    return response.data;
  },

  /** Update a single pricing document. At least one field must be sent. When sending rates, always send the full array—any omitted rate will be removed. */
  update: async (
    pricingId: string,
    data: PatchPricingDto
  ): Promise<PricingResponse> => {
    const response = await apiClient.patch<ApiResponse<PricingResponse>>(
      API_ENDPOINTS.PRICING.BY_ID(pricingId),
      data
    );
    return response.data;
  },

  /** Bulk update multiple pricing documents. */
  bulkUpdate: async (
    updates: BulkPricingUpdateDto['updates']
  ): Promise<PricingResponse[]> => {
    const response = await apiClient.post<ApiResponse<PricingResponse[]>>(
      API_ENDPOINTS.PRICING.BULK_UPDATE,
      { updates }
    );
    return response.data;
  },
};
