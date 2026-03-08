import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  ApiResponse,
  CreateLedgerEntryRequest,
  LedgerBalance,
  LedgerEntriesResponse,
  LedgerEntry,
  LedgerPartyType,
  PayablesResponse,
  ReceivablesResponse,
} from '@inventory-platform/types';

export const ledgerApi = {
  createEntry: async (
    data: CreateLedgerEntryRequest
  ): Promise<LedgerEntry> => {
    const response = await apiClient.post<ApiResponse<LedgerEntry>>(
      API_ENDPOINTS.LEDGER.BASE,
      data
    );
    return (response as ApiResponse<LedgerEntry>).data;
  },

  getBalance: async (
    partyType: LedgerPartyType,
    partyId: string
  ): Promise<LedgerBalance> => {
    const response = await apiClient.get<ApiResponse<LedgerBalance>>(
      API_ENDPOINTS.LEDGER.BALANCE,
      { partyType, partyId }
    );
    return (response as ApiResponse<LedgerBalance>).data;
  },

  listEntries: async (params?: {
    partyType?: LedgerPartyType;
    partyId?: string;
    page?: number;
    size?: number;
  }): Promise<LedgerEntriesResponse> => {
    const q: Record<string, string> = {};
    if (params?.partyType) q.partyType = params.partyType;
    if (params?.partyId) q.partyId = params.partyId;
    if (params?.page != null) q.page = String(params.page);
    if (params?.size != null) q.size = String(params.size);
    const response = await apiClient.get<ApiResponse<LedgerEntriesResponse>>(
      API_ENDPOINTS.LEDGER.ENTRIES,
      q
    );
    return (response as ApiResponse<LedgerEntriesResponse>).data;
  },

  /** Amounts to collect when this shop is the vendor's shop (buyer shops owe us). */
  getReceivables: async (): Promise<ReceivablesResponse> => {
    const response = await apiClient.get<ApiResponse<ReceivablesResponse>>(
      API_ENDPOINTS.LEDGER.RECEIVABLES
    );
    return (response as ApiResponse<ReceivablesResponse>).data;
  },

  /** Amounts to pay when this shop owes vendors. */
  getPayables: async (): Promise<PayablesResponse> => {
    const response = await apiClient.get<ApiResponse<PayablesResponse>>(
      API_ENDPOINTS.LEDGER.PAYABLES
    );
    return (response as ApiResponse<PayablesResponse>).data;
  },
};
