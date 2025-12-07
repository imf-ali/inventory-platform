import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  ApiResponse,
  SendInvitationDto,
  SendInvitationResponse,
  Invitation,
  InvitationsResponse,
  AcceptInvitationResponse,
<<<<<<< Updated upstream
  ShopUser,
  ShopUsersResponse,
=======
  ShopMember,
  ShopMembersResponse,
  UserShop,
  UserShopsResponse,
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
  // Get all invitations for the currently authenticated user
  getMyInvitations: async (): Promise<Invitation[]> => {
    const response = await apiClient.get<ApiResponse<InvitationsResponse>>(
      API_ENDPOINTS.USERS.INVITATIONS
    );
    return response.data.data;
  },

  // Get all invitations for a specific shop
  getShopInvitations: async (shopId: string): Promise<Invitation[]> => {
=======
  // Get all invitations for a specific shop
  getInvitationsByShop: async (shopId: string): Promise<Invitation[]> => {
>>>>>>> Stashed changes
    const response = await apiClient.get<ApiResponse<InvitationsResponse>>(
      API_ENDPOINTS.SHOPS.INVITATIONS(shopId)
    );
    return response.data.data;
  },

<<<<<<< Updated upstream
  // Get all users associated with a shop
  getShopUsers: async (shopId: string): Promise<ShopUser[]> => {
    const response = await apiClient.get<ApiResponse<ShopUsersResponse>>(
      API_ENDPOINTS.SHOPS.USERS_ALL(shopId)
=======
  // Get all invitations for a specific user
  getInvitationsByUser: async (userId: string): Promise<Invitation[]> => {
    const response = await apiClient.get<ApiResponse<InvitationsResponse>>(
      API_ENDPOINTS.USERS.INVITATIONS(userId)
    );
    return response.data.data;
  },

  // Get all invitations for the currently authenticated user
  getMyInvitations: async (): Promise<Invitation[]> => {
    const response = await apiClient.get<ApiResponse<InvitationsResponse>>(
      API_ENDPOINTS.ME.INVITATIONS
    );
    return response.data.data;
  },

  // Get all active members/users for a specific shop
  getShopMembers: async (shopId: string): Promise<ShopMember[]> => {
    const response = await apiClient.get<ApiResponse<ShopMembersResponse>>(
      API_ENDPOINTS.SHOPS.MEMBERS(shopId)
    );
    return response.data.data;
  },

  // Get all shops that a specific user is a member of
  getShopsByUser: async (userId: string): Promise<UserShop[]> => {
    const response = await apiClient.get<ApiResponse<UserShopsResponse>>(
      API_ENDPOINTS.USERS.SHOPS(userId)
    );
    return response.data.data;
  },

  // Get all shops that the currently authenticated user is a member of
  getMyShops: async (): Promise<UserShop[]> => {
    const response = await apiClient.get<ApiResponse<UserShopsResponse>>(
      API_ENDPOINTS.ME.SHOPS
>>>>>>> Stashed changes
    );
    return response.data.data;
  },
};

