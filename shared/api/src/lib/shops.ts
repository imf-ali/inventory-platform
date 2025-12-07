import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  ApiResponse,
  RegisterShopDto,
  RegisterShopResponse,
  RequestJoinShopDto,
  RequestJoinShopResponse,
  JoinRequest,
  JoinRequestsResponse,
  ProcessJoinRequestDto,
  ProcessJoinRequestResponse,
} from '@inventory-platform/types';

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

  requestToJoin: async (data: RequestJoinShopDto): Promise<RequestJoinShopResponse> => {
    const response = await apiClient.post<ApiResponse<RequestJoinShopResponse>>(
      API_ENDPOINTS.SHOPS.JOIN_REQUEST,
      data
    );
    // apiClient.post already unwraps axios response.data
    // So response is ApiResponse<RequestJoinShopResponse> = { success: true, data: { ... } }
    // We need to return response.data
    return response.data;
  },

  getJoinRequests: async (): Promise<JoinRequest[]> => {
    const response = await apiClient.get<ApiResponse<JoinRequestsResponse>>(
      API_ENDPOINTS.SHOPS.JOIN_REQUESTS
    );
    // API returns: { success: true, data: { data: [...] } }
    // apiClient.get already unwraps axios response.data
    // So response is ApiResponse<JoinRequestsResponse> = { success: true, data: { data: [...] } }
    // We need to return response.data.data
    return response.data.data;
  },

  processJoinRequest: async (
    requestId: string,
    data: ProcessJoinRequestDto
  ): Promise<ProcessJoinRequestResponse> => {
    const response = await apiClient.post<ApiResponse<ProcessJoinRequestResponse>>(
      API_ENDPOINTS.SHOPS.PROCESS_JOIN_REQUEST(requestId),
      data
    );
    return response.data;
  },
};

