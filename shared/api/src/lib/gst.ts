import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type { ApiResponse } from '@inventory-platform/types';

// GST Types
export interface RatewiseSummary {
  rate: number;
  taxableValue: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  cessAmount: number;
  invoiceCount: number;
}

export interface HsnSummary {
  hsnCode: string;
  description: string;
  uqc: string;
  totalQuantity: number;
  totalValue: number;
  taxableValue: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
}

export interface GstSummary {
  shopId: string;
  period: string;
  shopGstin: string;
  shopName: string;
  totalTaxableValue: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalCess: number;
  totalTaxLiability: number;
  totalInvoices: number;
  ratewiseSummary: RatewiseSummary[];
  hsnSummary: HsnSummary[];
}

export interface B2bInvoiceItem {
  rate: number;
  taxableValue: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  cessAmount: number;
}

export interface B2bInvoice {
  buyerGstin: string;
  buyerName: string;
  invoiceNo: string;
  invoiceDate: string;
  invoiceValue: number;
  placeOfSupply: string;
  reverseCharge: boolean;
  invoiceType: string;
  items: B2bInvoiceItem[];
}

export interface B2csSummary {
  placeOfSupply: string;
  rate: number;
  taxableValue: number;
  cgstAmount: number;
  sgstAmount: number;
  cessAmount: number;
}

export interface DocumentSummary {
  totalInvoicesIssued: number;
  fromInvoiceNo: string;
  toInvoiceNo: string;
  cancelledCount: number;
}

export interface Gstr1Report {
  shopId: string;
  gstin: string;
  period: string;
  legalName: string;
  b2bInvoices: B2bInvoice[];
  b2clInvoices: unknown[];
  b2csSummary: B2csSummary;
  hsnSummary: HsnSummary[];
  documentSummary: DocumentSummary;
}

export interface TaxComponent {
  taxableValue: number;
  igst: number;
  cgst: number;
  sgst: number;
  cess: number;
}

export interface OutwardSupplies {
  taxableSupplies: TaxComponent;
  zeroRatedSupplies: TaxComponent;
  nilRatedSupplies: TaxComponent;
  reverseChargeSupplies: TaxComponent;
  nonGstSupplies: TaxComponent;
}

export interface InputTaxCredit {
  itcAvailable: TaxComponent;
  itcReversed: TaxComponent;
  netItc: TaxComponent;
  ineligibleItc: TaxComponent;
}

export interface ExemptSupplies {
  interStateSupplies: number;
  intraStateSupplies: number;
}

export interface TaxPayment {
  igstPayable: number;
  cgstPayable: number;
  sgstPayable: number;
  cessPayable: number;
  totalPayable: number;
}

export interface Gstr3bReport {
  shopId: string;
  gstin: string;
  period: string;
  legalName: string;
  outwardSupplies: OutwardSupplies;
  interstateSupplies: unknown[];
  inputTaxCredit: InputTaxCredit;
  exemptSupplies: ExemptSupplies;
  taxPayment: TaxPayment;
}

export type GstReturnStatus = 'DRAFT' | 'GENERATED' | 'EXPORTED' | 'FILED' | 'AMENDED';
export type GstReturnType = 'GSTR1' | 'GSTR3B';

export interface GstReturn {
  id: string;
  shopId: string;
  returnType: GstReturnType;
  period: string;
  status: GstReturnStatus;
  totalTaxableValue: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalCess: number;
  totalTaxLiability: number;
  filedBy: string;
  filedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GstReturnsListResponse {
  returns: GstReturn[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const gstApi = {
  getSummary: async (period: string): Promise<GstSummary> => {
    const response = await apiClient.get<ApiResponse<GstSummary>>(
      API_ENDPOINTS.GST.SUMMARY,
      { period }
    );
    return response.data;
  },

  getGstr1: async (period: string): Promise<Gstr1Report> => {
    const response = await apiClient.get<ApiResponse<Gstr1Report>>(
      API_ENDPOINTS.GST.GSTR1,
      { period }
    );
    return response.data;
  },

  getGstr3b: async (period: string): Promise<Gstr3bReport> => {
    const response = await apiClient.get<ApiResponse<Gstr3bReport>>(
      API_ENDPOINTS.GST.GSTR3B,
      { period }
    );
    return response.data;
  },

  generateReturn: async (period: string, returnType: GstReturnType): Promise<GstReturn> => {
    const response = await apiClient.post<ApiResponse<GstReturn>>(
      `${API_ENDPOINTS.GST.RETURNS}?period=${period}&returnType=${returnType}`
    );
    return response.data;
  },

  listReturns: async (params?: { page?: number; limit?: number }): Promise<GstReturnsListResponse> => {
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams.page = params.page.toString();
    if (params?.limit) queryParams.limit = params.limit.toString();
    
    const response = await apiClient.get<ApiResponse<GstReturnsListResponse>>(
      API_ENDPOINTS.GST.RETURNS,
      queryParams
    );
    return response.data;
  },

  getReturnById: async (returnId: string): Promise<GstReturn> => {
    const response = await apiClient.get<ApiResponse<GstReturn>>(
      API_ENDPOINTS.GST.BY_ID(returnId)
    );
    return response.data;
  },

  markAsFiled: async (returnId: string): Promise<GstReturn> => {
    const response = await apiClient.post<ApiResponse<GstReturn>>(
      API_ENDPOINTS.GST.FILE(returnId)
    );
    return response.data;
  },
};

