import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  ApiResponse,
  SendInvitationDto,
  SendInvitationResponse,
  Invitation,
  InvitationsResponse,
  AcceptInvitationResponse,
  ShopUser,
  ShopUsersResponse,
} from '@inventory-platform/types';

export const invitationsApi = {
  // Send invitation to a user to join a shop
  sendInvitation: async (
    shopId: string,
    data: SendInvitationDto
  ): Promise<SendInvitationResponse> => {
    const response = await apiClient.post<ApiResponse<SendInvitationResponse>>(
      API_ENDPOINTS.SHOPS.INVITATIONS(shopId),
      data
    );
    return response.data;
  },

  // Accept a pending invitation
  acceptInvitation: async (
    invitationId: string
  ): Promise<AcceptInvitationResponse> => {
    const response = await apiClient.post<ApiResponse<AcceptInvitationResponse>>(
      API_ENDPOINTS.INVITATIONS.ACCEPT(invitationId)
    );
    return response.data;
  },

  // Get all invitations for the currently authenticated user
  getMyInvitations: async (): Promise<Invitation[]> => {
    const response = await apiClient.get<ApiResponse<InvitationsResponse>>(
      API_ENDPOINTS.USERS.INVITATIONS
    );
    return response.data.data;
  },

  // Get all invitations for a specific shop
  getShopInvitations: async (shopId: string): Promise<Invitation[]> => {
    const response = await apiClient.get<ApiResponse<InvitationsResponse>>(
      API_ENDPOINTS.SHOPS.INVITATIONS(shopId)
    );
    return response.data.data;
  },

  // Get all users associated with a shop
  getShopUsers: async (shopId: string): Promise<ShopUser[]> => {
    const response = await apiClient.get<ApiResponse<ShopUsersResponse>>(
      API_ENDPOINTS.SHOPS.USERS_ALL(shopId)
    );
    return response.data.data;
  },
};
