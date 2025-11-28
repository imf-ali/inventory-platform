import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  ApiResponse,
  CreateOrderDto,
  Order,
  PaginatedResponse,
} from './types';

export const ordersApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Order>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Order>>>(
      API_ENDPOINTS.ORDERS.BASE,
      params as Record<string, string>
    );
    return response.data;
  },

  getById: async (id: string): Promise<Order> => {
    const response = await apiClient.get<ApiResponse<Order>>(
      API_ENDPOINTS.ORDERS.BY_ID(id)
    );
    return response.data;
  },

  create: async (data: CreateOrderDto): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<Order>>(
      API_ENDPOINTS.ORDERS.BASE,
      data
    );
    return response.data;
  },

  updateStatus: async (
    id: string,
    status: Order['status']
  ): Promise<Order> => {
    const response = await apiClient.patch<ApiResponse<Order>>(
      API_ENDPOINTS.ORDERS.BY_ID(id),
      { status }
    );
    return response.data;
  },

  getByStatus: async (status: string): Promise<Order[]> => {
    const response = await apiClient.get<ApiResponse<Order[]>>(
      API_ENDPOINTS.ORDERS.BY_STATUS(status)
    );
    return response.data;
  },
};

