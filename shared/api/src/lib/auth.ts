import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  ApiResponse,
  AuthResponse,
  LoginDto,
  SignupDto,
  AcceptInviteDto,
  AcceptInviteResponse,
  LogoutDto,
  LogoutResponse,
  User,
} from './types';

export const authApi = {
  login: async (credentials: LoginDto): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    if (response.success && response.data.accessToken) {
      apiClient.setToken(response.data.accessToken);
    }
    return response.data;
  },

  signup: async (data: SignupDto): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.SIGNUP,
      data
    );
    if (response.success && response.data.accessToken) {
      apiClient.setToken(response.data.accessToken);
    }
    return response.data;
  },

  acceptInvite: async (data: AcceptInviteDto): Promise<AcceptInviteResponse> => {
    const response = await apiClient.post<ApiResponse<AcceptInviteResponse>>(
      API_ENDPOINTS.AUTH.ACCEPT_INVITE,
      data
    );
    return response.data;
  },

  logout: async (data: LogoutDto): Promise<LogoutResponse> => {
    try {
      const response = await apiClient.post<ApiResponse<LogoutResponse>>(
        API_ENDPOINTS.AUTH.LOGOUT,
        data
      );
      return response.data;
    } finally {
      apiClient.setToken(null);
    }
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(
      API_ENDPOINTS.AUTH.ME
    );
    return response.data;
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.REFRESH
    );
    if (response.success && response.data.accessToken) {
      apiClient.setToken(response.data.accessToken);
    }
    return response.data;
  },
};

