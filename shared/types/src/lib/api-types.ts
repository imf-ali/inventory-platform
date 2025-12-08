// API Types - All interfaces related to API requests/responses

// Common API types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Product types
export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  price: number;
  cost?: number;
  quantity: number;
  reorderLevel?: number;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  price: number;
  cost?: number;
  quantity: number;
  reorderLevel?: number;
  description?: string;
}

export interface UpdateProductDto extends Partial<Omit<CreateProductDto, 'name' | 'sku'>> {
  name?: string;
  sku?: string;
}

// Auth types
export interface User {
  userId: string;
  role: string;
  shopId: string | null;
  email?: string;
  name?: string;
  active?: boolean;
  createdAt?: string;
}

export interface LoginDto {
  idToken?: string; // For Google login
  email?: string; // Required if idToken is not provided
  password?: string; // Required if idToken is not provided
}

export interface SignupDto {
  idToken?: string; // For Google signup
  name?: string; // Required if idToken is not provided
  email?: string; // Required if idToken is not provided
  password?: string; // Required if idToken is not provided
  shopId?: string;
  role?: string; // Default role if not provided
}

export interface AcceptInviteDto {
  inviteToken: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface AcceptInviteResponse {
  userId: string;
  role: string;
  shopId: string;
  active: boolean;
}

export interface LogoutDto {
  userId: string;
  accessToken: string;
}

export interface LogoutResponse {
  deviceId: string;
}

// Order types
export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'cancelled';
  customerName?: string;
  createdAt: string;
}

export interface CreateOrderDto {
  items: Omit<OrderItem, 'total'>[];
  paymentMethod: string;
  customerName?: string;
}

// Analytics types
export interface SalesAnalytics {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  inventoryTurnover: number;
  period: string;
  trends: {
    sales: number[];
    orders: number[];
  };
}

// Alert types
export interface InventoryAlert {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  threshold: number;
  status: 'critical' | 'warning';
  createdAt: string;
}

// Reminder types
export type ReminderStatus = 'PENDING' | 'COMPLETED';
export type ReminderType = 'EXPIRY' | 'CUSTOM' | null;

export interface Reminder {
  reminderId: string;
  inventoryId: string | null;
  reminderAt: string;
  expiryDate: string | null;
  snoozeDays: number;
  notes: string | null;
  status: ReminderStatus;
  type: ReminderType;
}

export interface CreateReminderDto {
  inventoryId?: string;
  reminderAt: string;
  endDate?: string;
  notes?: string;
  type?: ReminderType;
}

export interface UpdateReminderDto {
  reminderAt?: string;
  endDate?: string;
  notes?: string;
  status?: ReminderStatus;
}

export interface CustomReminderInput {
  reminderAt: string;
  endDate: string;
  notes?: string;
}

// Shop types
export interface Location {
  primaryAddress: string;
  secondaryAddress?: string;
  state: string;
  city: string;
  pin: string;
  country: string;
}

export interface RegisterShopDto {
  name: string;
  businessId: string;
  location: Location;
  contactEmail: string;
  contactPhone: string;
}

export interface RegisterShopResponse {
  shopId: string;
  status: string;
}

export interface RequestJoinShopDto {
  ownerEmail: string;
  message?: string;
  role: string;
}

export interface RequestJoinShopResponse {
  requestId: string;
  shopId: string;
  shopName: string;
  status: string;
  message: string;
  createdAt: string;
}

export type JoinRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface JoinRequest {
  requestId: string;
  shopId: string;
  shopName: string;
  userId: string;
  userEmail: string;
  userName: string;
  requestedRole: string;
  status: JoinRequestStatus;
  message: string;
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
}

export interface JoinRequestsResponse {
  data: JoinRequest[];
}

export interface ProcessJoinRequestDto {
  action: 'ACCEPT' | 'REJECT';
}

export interface ProcessJoinRequestResponse {
  requestId: string;
  shopId: string;
  shopName: string;
  userId: string;
  userEmail: string;
  userName: string;
  status: string;
  reviewedAt: string;
  message: string;
}

// Inventory types
export interface CreateInventoryDto {
  barcode: string;
  name: string;
  companyName: string;
  price: number;
  maximumRetailPrice: number;
  costPrice: number;
  sellingPrice: number;
  businessType: string;
  location: string;
  count: number;
  expiryDate: string;
  description?: string;
  reminderAt?: string;
  customReminders?: CustomReminderInput[];
}

export interface InventoryResponse {
  id: string;
  lotId: string | null;
  barcode: string;
  reminderCreated: boolean;
}

export interface InventoryItem {
  lotId: string;
  barcode: string | null;
  name: string | null;
  description: string | null;
  companyName: string | null;
  maximumRetailPrice: number;
  costPrice: number;
  sellingPrice: number;
  receivedCount: number;
  soldCount: number;
  currentCount: number;
  location: string;
  expiryDate: string;
  shopId: string;
}

export interface InventoryListResponse {
  data: InventoryItem[];
  meta: unknown | null;
}

// Checkout types
export interface CheckoutItem {
  lotId: string;
  quantity: number;
  sellingPrice: number;
}

export interface CreateCheckoutDto {
  businessType: string;
  paymentMethod: string;
  items: CheckoutItem[];
}

export interface CheckoutItemResponse {
  inventoryId: string;
  name: string;
  quantity: number;
  maximumRetailPrice: number;
  sellingPrice: number;
  discount: number;
}

export interface CheckoutResponse {
  invoiceId: string;
  invoiceNo: string;
  businessType: string;
  userId: string;
  shopId: string;
  items: CheckoutItemResponse[];
  subTotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  paymentMethod: string;
  status: string;
}

// Cart types
export interface CartResponse {
  purchaseId: string;
  invoiceId: string;
  invoiceNo: string;
  businessType: string;
  userId: string;
  shopId: string;
  items: CheckoutItemResponse[];
  subTotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  status: string;
  customerName?: string;
  customerAddress?: string;
  customerPhone?: string;
  paymentMethod?: string;
}

export interface AddToCartDto {
  businessType: string;
  items: CheckoutItem[];
  customerName?: string;
  customerAddress?: string;
  customerPhone?: string;
}

export interface UpdateCartStatusDto {
  purchaseId: string;
  status: string;
  paymentMethod: string;
}

// Purchase History types
export interface Purchase {
  purchaseId: string;
  invoiceId: string;
  invoiceNo: string;
  businessType: string;
  userId: string;
  shopId: string;
  items: CheckoutItemResponse[];
  subTotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  soldAt: string;
  status: string;
  paymentMethod: string;
  customerName: string | null;
  customerAddress: string | null;
  customerPhone: string | null;
}

export interface PurchaseHistoryResponse {
  purchases: Purchase[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetPurchasesParams {
  page?: number;
  limit?: number;
  order?: string; // e.g., "soldAt:desc"
}

// Invitation types
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface Invitation {
  invitationId: string;
  shopId: string;
  shopName: string;
  inviterUserId: string;
  inviterName: string;
  inviteeUserId?: string;
  inviteeEmail: string;
  inviteeName?: string;
  role: string;
  status: InvitationStatus;
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string | null;
  rejectedAt?: string | null;
}

export interface SendInvitationDto {
  inviteeEmail: string;
  role: string;
}

export interface SendInvitationResponse {
  invitationId: string;
  shopId: string;
  inviteeEmail: string;
  role: string;
  status: InvitationStatus;
  createdAt: string;
  expiresAt: string;
  message: string;
}

export interface AcceptInvitationResponse {
  invitationId: string;
  shopId: string;
  shopName: string;
  userId: string;
  role: string;
  acceptedAt: string;
  message: string;
}

export interface InvitationsResponse {
  data: Invitation[];
}

// Shop User types
export type UserRelationship = 'OWNER' | 'INVITED' | null;

export interface ShopUser {
  userId: string;
  name: string;
  email: string;
  role: string;
  relationship: UserRelationship;
  active: boolean;
  joinedAt: string | null;
}

export interface ShopUsersResponse {
  data: ShopUser[];
}

// User Role type
export type UserRole = 'ADMIN' | 'MANAGER' | 'CASHIER';

