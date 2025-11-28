import { create } from 'zustand';
import { productsApi } from '@inventory-platform/api';
import type { Product, CreateProductDto, UpdateProductDto } from '@inventory-platform/api';

interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  fetchProducts: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }) => Promise<void>;
  fetchProductById: (id: string) => Promise<void>;
  createProduct: (data: CreateProductDto) => Promise<void>;
  updateProduct: (id: string, data: UpdateProductDto) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  searchProducts: (query: string) => Promise<void>;
  fetchLowStock: () => Promise<void>;
  setSelectedProduct: (product: Product | null) => void;
  clearError: () => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  selectedProduct: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  fetchProducts: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productsApi.getAll(params);
      set({
        products: response.data,
        pagination: {
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        },
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch products';
      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  fetchProductById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const product = await productsApi.getById(id);
      set({
        selectedProduct: product,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch product';
      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  createProduct: async (data: CreateProductDto) => {
    set({ isLoading: true, error: null });
    try {
      const newProduct = await productsApi.create(data);
      set((state) => ({
        products: [newProduct, ...state.products],
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create product';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  updateProduct: async (id: string, data: UpdateProductDto) => {
    set({ isLoading: true, error: null });
    try {
      const updatedProduct = await productsApi.update(id, data);
      set((state) => ({
        products: state.products.map((p) =>
          p.id === id ? updatedProduct : p
        ),
        selectedProduct:
          state.selectedProduct?.id === id
            ? updatedProduct
            : state.selectedProduct,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update product';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  deleteProduct: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await productsApi.delete(id);
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        selectedProduct:
          state.selectedProduct?.id === id ? null : state.selectedProduct,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete product';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  searchProducts: async (query: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productsApi.search(query);
      set({
        products: response.data,
        pagination: {
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        },
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search products';
      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  fetchLowStock: async () => {
    set({ isLoading: true, error: null });
    try {
      const products = await productsApi.getLowStock();
      set({
        products,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch low stock products';
      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  setSelectedProduct: (product: Product | null) => {
    set({ selectedProduct: product });
  },

  clearError: () => set({ error: null }),
}));

