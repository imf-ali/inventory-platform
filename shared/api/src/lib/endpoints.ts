// API Endpoints configuration

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    ACCEPT_INVITE: '/auth/accept-invite',
  },

  // Product endpoints
  PRODUCTS: {
    BASE: '/products',
    BY_ID: (id: string) => `/products/${id}`,
    SEARCH: '/products/search',
    LOW_STOCK: '/products/low-stock',
    BY_CATEGORY: (category: string) => `/products/category/${category}`,
  },

  // Order endpoints
  ORDERS: {
    BASE: '/orders',
    BY_ID: (id: string) => `/orders/${id}`,
    BY_STATUS: (status: string) => `/orders/status/${status}`,
  },

  // Analytics endpoints
  ANALYTICS: {
    BASE: '/analytics',
    SALES: '/analytics/sales',
    INVENTORY: '/analytics/inventory',
  },

  // Alert endpoints
  ALERTS: {
    BASE: '/alerts',
    BY_ID: (id: string) => `/alerts/${id}`,
    INVENTORY: '/alerts/inventory',
  },

  // Reminder endpoints
  REMINDERS: {
    BASE: '/reminders',
    BY_ID: (id: string) => `/reminders/${id}`,
    BY_TYPE: (type: string) => `/reminders/type/${type}`,
    SNOOZE: (id: string) => `/reminders/${id}/snooze`,
    STREAM: '/reminders/stream',
  },

  // Shop endpoints
  SHOPS: {
    REGISTER: '/shops/register',
    JOIN_REQUEST: '/shops/join-request',
    JOIN_REQUESTS: '/shops/join-requests',
    PROCESS_JOIN_REQUEST: (requestId: string) => `/shops/join-requests/${requestId}/process`,
    INVITATIONS: (shopId: string) => `/shops/${shopId}/invitations`,
    USERS_ALL: (shopId: string) => `/shops/${shopId}/users/all`,
  },

  // Invitation endpoints
  INVITATIONS: {
    ACCEPT: (invitationId: string) => `/invitations/${invitationId}/accept`,
  },

  // User endpoints
  USERS: {
    INVITATIONS: '/users/invitations',
  },

  // Inventory endpoints
  INVENTORY: {
    BASE: '/inventory',
    SEARCH: '/inventory/search',
  },

  // Checkout endpoints
  CHECKOUT: {
    BASE: '/checkout',
  },

  // Cart endpoints
  CART: {
    BASE: '/cart',
    ADD: '/cart/upsert',
    STATUS: '/cart/status',
  },

  // Purchase endpoints
  PURCHASES: {
    BASE: '/purchases',
  },
} as const;

