import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  ApiResponse,
  CreateProductDto,
  PaginatedResponse,
  Product,
  UpdateProductDto,
} from './types';

export const productsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Product>>>(
      API_ENDPOINTS.PRODUCTS.BASE,
      params as Record<string, string>
    );
    return response.data;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get<ApiResponse<Product>>(
      API_ENDPOINTS.PRODUCTS.BY_ID(id)
    );
    return response.data;
  },

  create: async (data: CreateProductDto): Promise<Product> => {
    const response = await apiClient.post<ApiResponse<Product>>(
      API_ENDPOINTS.PRODUCTS.BASE,
      data
    );
    return response.data;
  },

  update: async (id: string, data: UpdateProductDto): Promise<Product> => {
    const response = await apiClient.put<ApiResponse<Product>>(
      API_ENDPOINTS.PRODUCTS.BY_ID(id),
      data
    );
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.PRODUCTS.BY_ID(id));
  },

  search: async (query: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Product>>>(
      API_ENDPOINTS.PRODUCTS.SEARCH,
      { q: query, ...params } as unknown as Record<string, string>
    );
    return response.data;
  },

  getLowStock: async (): Promise<Product[]> => {
    const response = await apiClient.get<ApiResponse<Product[]>>(
      API_ENDPOINTS.PRODUCTS.LOW_STOCK
    );
    return response.data;
  },

  getByCategory: async (category: string): Promise<Product[]> => {
    const response = await apiClient.get<ApiResponse<Product[]>>(
      API_ENDPOINTS.PRODUCTS.BY_CATEGORY(category)
    );
    return response.data;
  },
};

