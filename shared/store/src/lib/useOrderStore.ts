import { create } from 'zustand';
import { ordersApi } from '@inventory-platform/api';
import type { OrderState, Order, CreateOrderDto } from '@inventory-platform/types';

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  selectedOrder: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  fetchOrders: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await ordersApi.getAll(params);
      set({
        orders: response.data,
        pagination: {
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        },
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch orders';
      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  fetchOrderById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const order = await ordersApi.getById(id);
      set({
        selectedOrder: order,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch order';
      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  createOrder: async (data: CreateOrderDto) => {
    set({ isLoading: true, error: null });
    try {
      const order = await ordersApi.create(data);
      set((state) => ({
        orders: [order, ...state.orders],
        isLoading: false,
      }));
      return order;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  updateOrderStatus: async (id: string, status: Order['status']) => {
    set({ isLoading: true, error: null });
    try {
      const updatedOrder = await ordersApi.updateStatus(id, status);
      set((state) => ({
        orders: state.orders.map((o) => (o.id === id ? updatedOrder : o)),
        selectedOrder:
          state.selectedOrder?.id === id
            ? updatedOrder
            : state.selectedOrder,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update order status';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  setSelectedOrder: (order: Order | null) => {
    set({ selectedOrder: order });
  },

  clearError: () => set({ error: null }),
}));

