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
export interface Reminder {
  id: string;
  type: 'sell' | 'return';
  productId?: string;
  productName: string;
  orderId?: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed';
  createdAt: string;
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
}

export interface InventoryResponse {
  lotId: string;
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

